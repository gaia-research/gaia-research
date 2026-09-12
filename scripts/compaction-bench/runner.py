#!/usr/bin/env python3
"""Context Compaction Phase 2 — Benchmark Runner

Automates execution of benchmark arms and scenarios:
- Sets up per-arm sandbox with jq-patched models.json
- Creates isolated git worktree with node_modules symlink
- Spawns Herdr pane, starts pi agent on antigravity/gemini-3.8-flash:high
- Sends turn prompts sequentially, scraping TUI status bar in <10ms
- Handles scenario-specific idle delays (e.g. 7m cache-cold delays)
- On completion: archives pane to Archive tab, queries skill-cost, writes summary
"""

import argparse
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
import time

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
ARM_CONFIGS = {
    "A-50k": {"window": 50000, "disabled": False},
    "A-100k": {"window": 100000, "disabled": False},
    "A-150k": {"window": 150000, "disabled": False},
    "A-200k": {"window": 200000, "disabled": False},
    "A-272k": {"window": 272000, "disabled": False},
    "A-500k": {"window": 500000, "disabled": False},
    "A-1M": {"window": 1048576, "disabled": False},
    "A-disabled": {"window": 1048576, "disabled": True},
}

SCENARIO_WORKLOADS = {
    1: {"file": "workloads/bugfix.md", "fixture": "bugfix-repo", "turns": 20, "idles": {6: 420, 11: 420}},
    2: {"file": "workloads/feature.md", "fixture": "feature-repo", "turns": 30, "idles": {}},
    3: {"file": "workloads/refactor.md", "fixture": "refactor-repo", "turns": 25, "idles": {}},
    4: {"file": "workloads/feature.md", "fixture": "feature-repo", "turns": 25, "idles": {8: 420, 16: 420}},
    6: {"file": "workloads/endurance.md", "fixture": "feature-repo", "turns": 50, "idles": {}},
}

ARCHIVE_TAB = "w7:t8"

def check_agy_usage():
    try:
        out = subprocess.check_output(["agy", "-p", "/usage"], stderr=subprocess.DEVNULL).decode("utf-8")
        clean = re.sub(r"\x1b\[[0-9;]*m", "", out)
        five_hour, weekly = None, None
        in_gemini = False
        for line in clean.splitlines():
            if "Gemini Models" in line:
                in_gemini = True
            elif "Claude & GPT Models" in line:
                in_gemini = False
            if in_gemini:
                m_5h = re.search(r"Five-Hour Limit:\s*([0-9.]+)%", line)
                if m_5h:
                    five_hour = float(m_5h.group(1))
                m_wk = re.search(r"Weekly Limit:\s*([0-9.]+)%", line)
                if m_wk:
                    weekly = float(m_wk.group(1))
        return five_hour, weekly
    except Exception:
        return None, None


def extract_last_turn_usage(session_path: str) -> dict:
    if not os.path.exists(session_path):
        return {}
    last_assistant_msg = None
    with open(session_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                evt = json.loads(line)
                if evt.get("type") == "message" and evt.get("message", {}).get("role") == "assistant":
                    last_assistant_msg = evt["message"]
            except Exception:
                pass

    if last_assistant_msg:
        usage = last_assistant_msg.get("usage", {})
        return {
            "input": usage.get("input", 0),
            "output": usage.get("output", 0),
            "cacheRead": usage.get("cacheRead", 0),
            "reasoning": usage.get("reasoning", 0),
        }
    return {}



def log(msg: str):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def parse_workload_turns(filepath: str) -> dict[int, str]:
    with open(filepath, "r") as f:
        text = f.read()
    raw = re.findall(r"## Turn (\d+)\s*\n\n(.*?)(?=\n## Turn |\Z)", text, re.DOTALL)
    return {int(num): prompt.strip() for num, prompt in raw}


def scrape_status_bar(agent_name: str) -> dict:
    t0 = time.time()
    cmd = ["herdr", "agent", "read", agent_name, "--source", "recent-unwrapped", "--lines", "20"]
    try:
        out = subprocess.check_output(cmd).decode("utf-8", errors="replace")
    except Exception as e:
        log(f"Warning: scrape failed: {e}")
        return {}

    # Locate the active status bar line (contains percentage and model or auto marker)
    status_line = ""
    for line in reversed(out.splitlines()):
        if "%" in line and ("auto" in line or "•" in line or "high" in line):
            status_line = line
            break

    context_pct = None
    m_ctx = re.search(r"([0-9.]+%/[0-9]+[kM]?|\(\?%/[0-9]+[kM]?\))", status_line)
    if m_ctx:
        context_pct = m_ctx.group(1)

    tokens_in = None
    m_in = re.search(r"↑([0-9.]+[kM]?)", status_line)
    if m_in:
        tokens_in = m_in.group(1)

    tokens_out = None
    m_out = re.search(r"↓([0-9.]+[kM]?)", status_line)
    if m_out:
        tokens_out = m_out.group(1)

    turn_cost = None
    m_cost = re.search(r"\$([0-9.]+)", status_line)
    if m_cost:
        try:
            turn_cost = float(m_cost.group(1))
        except ValueError:
            pass

    compaction = None
    m_comp = re.search(r"Compacted from [0-9,]+ tokens[^\n]*", out)
    if m_comp:
        compaction = m_comp.group(0)

    cache_miss = None
    m_miss = re.search(r"Cache miss after [^\n]+", out)
    if m_miss:
        cache_miss = m_miss.group(0)

    elapsed = time.time() - t0
    return {
        "context_pct": context_pct,
        "tokens_in": tokens_in,
        "tokens_out": tokens_out,
        "turn_cost": turn_cost,
        "compaction": compaction,
        "cache_miss": cache_miss,
        "scrape_latency_sec": round(elapsed, 4),
    }


def wait_until_idle(agent_name: str, max_wait_sec: int = 60):
    start = time.time()
    while time.time() - start < max_wait_sec:
        out = json.loads(subprocess.check_output(["herdr", "agent", "get", agent_name]))
        status = out.get("result", {}).get("agent", {}).get("agent_status")
        if status == "idle":
            return True
        time.sleep(1)
    return False


def run_arm(
    scenario: int,
    arm: str,
    max_turns: int | None = None,
    skip_idle: bool = False,
    resume_turn: int | None = None,
    resume_pane: str | None = None,
    resume_agent: str | None = None,
    resume_sandbox: str | None = None,
    resume_worktree: str | None = None,
):
    sc_info = SCENARIO_WORKLOADS[scenario]
    arm_info = ARM_CONFIGS[arm]
    window = arm_info["window"]
    workload_path = os.path.join(REPO_ROOT, "scripts/compaction-bench", sc_info["file"])
    turns_dict = parse_workload_turns(workload_path)
    total_turns = max_turns if max_turns else sc_info["turns"]
    idles_dict = {} if skip_idle else sc_info["idles"]

    date_str = datetime.date.today().isoformat()
    run_log_path = os.path.join(
        REPO_ROOT, f"scripts/compaction-bench/data/runs/run-{date_str}-{arm}-scenario-{scenario}.jsonl"
    )
    os.makedirs(os.path.dirname(run_log_path), exist_ok=True)

    log(f"==================================================")
    log(f"Starting Scenario {scenario}, Arm {arm}" + (f" (Resuming at Turn {resume_turn})" if resume_turn else ""))
    log(f"Context Window: {window} | Compaction: {'DISABLED' if arm_info['disabled'] else 'ENABLED'}")
    log(f"Workload: {sc_info['file']} ({total_turns} turns)")
    log(f"Logging ticks to: {run_log_path}")
    log(f"==================================================")

    if resume_turn and resume_pane and resume_agent:
        pane_id = resume_pane
        agent_name = resume_agent
        sandbox_dir = resume_sandbox or f"/tmp/compaction-bench-sandbox-{arm}"
        worktree_dir = resume_worktree or f"/tmp/compaction-bench-{arm}-s{scenario}"
        log(f"Resuming with existing pane {pane_id} and agent {agent_name}")
    else:
        # 1. Create Sandbox
        sandbox_script = os.path.join(REPO_ROOT, "scripts/compaction-bench/sandbox/create-sandbox.sh")
        sandbox_out = subprocess.check_output(
            ["bash", "-c", f"source '{sandbox_script}' '{arm}' {window} && echo SANDBOX_DIR=$SANDBOX_DIR"]
        ).decode("utf-8")
        m_sb = re.search(r"SANDBOX_DIR=(.*)", sandbox_out)
        if not m_sb:
            raise RuntimeError("Failed to resolve SANDBOX_DIR from create-sandbox.sh")
        sandbox_dir = m_sb.group(1).strip()
        log(f"Sandbox created at {sandbox_dir}")

        # 2. Create git worktree
        worktree_dir = f"/tmp/compaction-bench-{arm}-s{scenario}"
        if os.path.exists(worktree_dir):
            subprocess.run(["git", "worktree", "remove", worktree_dir, "--force"], stderr=subprocess.DEVNULL)
            shutil.rmtree(worktree_dir, ignore_errors=True)

        subprocess.check_call(["git", "worktree", "add", worktree_dir, "--detach", "HEAD"])
        # Symlink node_modules
        wt_node_modules = os.path.join(worktree_dir, "node_modules")
        if not os.path.exists(wt_node_modules):
            os.symlink(os.path.join(REPO_ROOT, "node_modules"), wt_node_modules)

        fixture_dir = os.path.join(worktree_dir, "scripts/compaction-bench/fixtures", sc_info["fixture"])
        log(f"Worktree prepared at {fixture_dir}")

        # 3. Split Herdr pane
        split_res = json.loads(
            subprocess.check_output(
                [
                    "herdr",
                    "pane",
                    "split",
                    "--current",
                    "--direction",
                    "right",
                    "--ratio",
                    "0.45",
                    "--cwd",
                    fixture_dir,
                    "--env",
                    f"PI_CODING_AGENT_DIR={sandbox_dir}",
                    "--no-focus",
                ]
            )
        )
        pane_id = split_res["result"]["pane"]["pane_id"]
        log(f"Created Herdr pane {pane_id}")

        # Safety export in pane
        subprocess.run(["herdr", "pane", "run", pane_id, f'export PI_CODING_AGENT_DIR="{sandbox_dir}"'], check=True)
        time.sleep(1)

        agent_name = f"{arm.lower()}-s{scenario}-{int(time.time()) % 10000}"

    session_id = None
    session_path = None

    try:
        if not resume_turn:
            # 4. Start agent
            log(f"Starting agent {agent_name}...")
            start_res = json.loads(
                subprocess.check_output(
                    [
                        "herdr",
                        "agent",
                        "start",
                        agent_name,
                        "--kind",
                        "pi",
                        "--pane",
                        pane_id,
                        "--timeout",
                        "120000",
                        "--",
                        "--model",
                        "antigravity/gemini-3.8-flash:high",
                    ]
                )
            )
        # Wait up to 15 seconds for herdr to discover agent_session
        for _ in range(15):
            try:
                agent_meta = json.loads(subprocess.check_output(["herdr", "agent", "get", agent_name]))
                sess = agent_meta.get("result", {}).get("agent", {}).get("agent_session")
                if sess and isinstance(sess, dict) and sess.get("value"):
                    session_path = sess["value"]
                    session_id = os.path.basename(session_path).replace(".jsonl", "").split("_")[-1]
                    break
            except Exception:
                pass
            time.sleep(1)

        if not session_path:
            # Fallback: scan sandbox directory
            sessions_dir = os.path.join(sandbox_dir, "sessions")
            if os.path.exists(sessions_dir):
                for root, _, files in os.walk(sessions_dir):
                    for f in files:
                        if f.endswith(".jsonl"):
                            session_path = os.path.join(root, f)
                            session_id = os.path.basename(f).replace(".jsonl", "").split("_")[-1]
                            break

        log(f"Agent started. Session ID: {session_id}")

        # Wait for initial prompt readiness
        time.sleep(2)
        initial_scrape = scrape_status_bar(agent_name)
        log(f"Initial context meter: {initial_scrape.get('context_pct', 'unknown')}")

        # 5. Execute turns
        start_turn = resume_turn if resume_turn else 1
        for t in range(start_turn, total_turns + 1):
            prompt = turns_dict.get(t)
            if not prompt:
                log(f"Turn {t} prompt not found in workload file. Stopping.")
                break

            turn_start_ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
            log(f"--- Turn {t}/{total_turns} ---")
            log(f"Prompt ({len(prompt)} chars): {prompt[:80]}...")

            wait_until_idle(agent_name)

            # Send prompt and wait for completion
            t_prompt_start = time.time()
            prompt_res = subprocess.check_output(
                ["herdr", "agent", "prompt", agent_name, prompt, "--wait", "--timeout", "420000"]
            )
            duration_sec = round(time.time() - t_prompt_start, 2)

            # Fast scrape
            signals = scrape_status_bar(agent_name)
            log(
                f"Turn {t} completed in {duration_sec}s | "
                f"Ctx: {signals.get('context_pct')} | "
                f"In: {signals.get('tokens_in')} | Out: {signals.get('tokens_out')} | Cost: ${signals.get('turn_cost')}"
            )
            if signals.get("compaction"):
                log(f"🔥 COMPACTION EVENT: {signals['compaction']}")
            if signals.get("cache_miss"):
                log(f"❄️ CACHE MISS: {signals['cache_miss']}")

            # Record tick
            tick = {
                "scenario": scenario,
                "arm": arm,
                "turn": t,
                "timestamp": turn_start_ts,
                "duration_sec": duration_sec,
                "context_pct": signals.get("context_pct"),
                "tokens_in": signals.get("tokens_in"),
                "tokens_out": signals.get("tokens_out"),
                "turn_cost": signals.get("turn_cost"),
                "compaction_event": signals.get("compaction"),
                "cache_miss": signals.get("cache_miss"),
                "scrape_latency_sec": signals.get("scrape_latency_sec"),
            }
            with open(run_log_path, "a") as rf:
                rf.write(json.dumps(tick) + "\n")

            # Check if this turn requires an idle delay
            if t in idles_dict:
                idle_sec = idles_dict[t]
                log(f"⏳ Turn {t} idle delay: sleeping {idle_sec}s ({idle_sec/60:.1f}m) to expire cache TTL...")
                time.sleep(idle_sec)
                log(f"Idle delay complete.")

        log(f"All {total_turns} turns completed for {arm}-s{scenario}.")

        # 6. Session archiving & skill-cost summary
        log("Archiving session and calculating authoritative cost...")
        if session_path and os.path.exists(session_path):
            archived_session_path = os.path.join(
                REPO_ROOT, f"scripts/compaction-bench/data/sessions/session-{arm}-s{scenario}.jsonl"
            )
            shutil.copyfile(session_path, archived_session_path)
            log(f"Copied session to {archived_session_path}")

        if session_id:
            summary_cost_path = os.path.join(
                REPO_ROOT, f"scripts/compaction-bench/data/summary/{arm}-s{scenario}-cost.json"
            )
            cost_cmd = [
                "python3",
                os.path.expanduser("~/skill-cost/cost.py"),
                "--session",
                session_id,
                "--json",
            ]
            cost_json = subprocess.check_output(cost_cmd).decode("utf-8")
            with open(summary_cost_path, "w") as sf:
                sf.write(cost_json)
            summary_data = json.loads(cost_json)
            grand_total = summary_data.get("grand_total_cost_usd", 0)
            grand_tokens = summary_data.get("grand_total_tokens", 0)
            log(f"Authoritative Cost: ${grand_total:.6f} | Tokens: {grand_tokens:,}")

    finally:
        # 7. Move pane to Archive tab
        log(f"Moving worker pane {pane_id} to Archive tab {ARCHIVE_TAB}...")
        try:
            subprocess.run(
                ["herdr", "pane", "move", pane_id, "--tab", ARCHIVE_TAB, "--split", "down", "--no-focus"],
                check=True,
            )
        except Exception as e:
            log(f"Warning: Failed to move pane to archive: {e}")

        # 8. Clean up worktree and sandbox
        log(f"Cleaning up worktree {worktree_dir}...")
        subprocess.run(["git", "worktree", "remove", worktree_dir, "--force"], stderr=subprocess.DEVNULL)
        shutil.rmtree(worktree_dir, ignore_errors=True)

        log(f"Cleaning up sandbox {sandbox_dir}...")
        shutil.rmtree(sandbox_dir, ignore_errors=True)

    log(f"Arm {arm} for Scenario {scenario} complete.")


WARMUP_COUNTS = {
    "20k": 0,
    "80k": 8,
    "180k": 18,
    "272k": 28,
}

MEASUREMENT_PROMPT = (
    "Refactor src/data-pipeline/pipeline.ts from callback hell to modern async/await with typed errors. "
    "Create src/data-pipeline/types.ts with PipelineError, FetchResult, TransformResult, and LoadResult. "
    "Update pipeline.ts to return a Promise and wrap async calls in structured try/catch blocks. "
    "Run npx tsc --noEmit to verify no type errors."
)


def run_scenario_3(size: str, rep: int) -> dict:
    label = f"{size}-rep{rep}"
    log(f"==================================================")
    log(f"Starting Scenario 3, Run: {label} (Size: {size}, Rep: {rep})")
    log(f"Model: antigravity/gemini-3.8-flash:high")
    log(f"==================================================")

    # 1. Quota Check
    five_hour, weekly = check_agy_usage()
    log(f"Gemini Models Quota: 5-Hour: {five_hour}% | Weekly: {weekly}%")
    if five_hour is not None and five_hour < 10:
        log(f"CRITICAL: 5-hour quota remaining ({five_hour}%) < 10%. Pausing before {label}.")
        sys.exit(1)
    if weekly is not None and weekly < 2:
        log(f"CRITICAL: Weekly quota remaining ({weekly}%) < 2%. Pausing before {label}.")
        sys.exit(1)

    # 2. Setup Sandbox & Worktree
    sandbox_script = os.path.join(REPO_ROOT, "scripts/compaction-bench/sandbox/create-sandbox.sh")
    sandbox_out = subprocess.check_output(
        ["bash", "-c", f"source '{sandbox_script}' 'A-272k' 272000 && echo SANDBOX_DIR=$SANDBOX_DIR"]
    ).decode("utf-8")
    m_sb = re.search(r"SANDBOX_DIR=(.*)", sandbox_out)
    if not m_sb:
        raise RuntimeError("Failed to resolve SANDBOX_DIR from create-sandbox.sh")
    sandbox_dir = m_sb.group(1).strip()
    log(f"Sandbox created at {sandbox_dir}")

    worktree_dir = f"/tmp/compaction-bench-s3-{size}-r{rep}"
    if os.path.exists(worktree_dir):
        subprocess.run(["git", "worktree", "remove", worktree_dir, "--force"], stderr=subprocess.DEVNULL)
        shutil.rmtree(worktree_dir, ignore_errors=True)

    subprocess.check_call(["git", "worktree", "add", worktree_dir, "--detach", "HEAD"])
    wt_node_modules = os.path.join(worktree_dir, "node_modules")
    if not os.path.exists(wt_node_modules):
        os.symlink(os.path.join(REPO_ROOT, "node_modules"), wt_node_modules)

    fixture_dir = os.path.join(worktree_dir, "scripts/compaction-bench/fixtures/refactor-repo")

    # 3. Create Herdr Pane (Explicitly split from w7:p3 in w7:t3)
    res_pane = json.loads(
        subprocess.check_output(
            [
                "herdr",
                "pane",
                "split",
                "--pane",
                "w7:p3",
                "--direction",
                "right",
                "--ratio",
                "0.45",
                "--cwd",
                fixture_dir,
                "--env",
                f"PI_CODING_AGENT_DIR={sandbox_dir}",
            ]
        )
    )
    pane_id = res_pane["result"]["pane"]["pane_id"]
    log(f"Created visible Herdr pane {pane_id} in tab w7:t3")
    subprocess.run(["herdr", "pane", "run", pane_id, f'export PI_CODING_AGENT_DIR="{sandbox_dir}"'], check=True)
    time.sleep(1)

    agent_name = f"s3-{size.lower()}-r{rep}-{int(time.time()) % 10000}"

    # 4. Start Agent
    log(f"Starting agent {agent_name} in visible pane {pane_id}...")
    subprocess.run(
        [
            "herdr",
            "agent",
            "start",
            agent_name,
            "--kind",
            "pi",
            "--pane",
            pane_id,
            "--timeout",
            "120000",
            "--",
            "--model",
            "antigravity/gemini-3.8-flash:high",
        ],
        check=True,
    )

    session_path = None
    for _ in range(15):
        try:
            agent_meta = json.loads(subprocess.check_output(["herdr", "agent", "get", agent_name]))
            sess = agent_meta.get("result", {}).get("agent", {}).get("agent_session")
            if sess and isinstance(sess, dict) and sess.get("value"):
                session_path = sess["value"]
                break
        except Exception:
            pass
        time.sleep(1)

    log(f"Agent running. Session path: {session_path}")
    time.sleep(2)

    try:
        # 5. Warmup turns (if needed)
        warmup_workload = parse_workload_turns(
            os.path.join(REPO_ROOT, "scripts/compaction-bench/workloads/refactor.md")
        )
        warmup_count = WARMUP_COUNTS.get(size, 0)
        for w_idx in range(1, warmup_count + 1):
            w_prompt = warmup_workload.get(w_idx, f"Inspect codebase files and summarize structure step {w_idx}.")
            log(f"[Warm-up {w_idx}/{warmup_count}] Sending prompt: {w_prompt[:60]}...")
            wait_until_idle(agent_name)
            subprocess.run(
                ["herdr", "agent", "prompt", agent_name, w_prompt, "--wait", "--timeout", "300000"],
                check=True,
            )
            sig = scrape_status_bar(agent_name)
            log(
                f"[Warm-up {w_idx}/{warmup_count}] Done | Context: {sig.get('context_pct')} | "
                f"Tokens: ↑{sig.get('tokens_in')} ↓{sig.get('tokens_out')}"
            )

        # 6. Measurement turn
        log(f"*** ISSUING MEASUREMENT TASK for {label} ***")
        wait_until_idle(agent_name)
        t_start = time.time()
        subprocess.run(
            ["herdr", "agent", "prompt", agent_name, MEASUREMENT_PROMPT, "--wait", "--timeout", "420000"],
            check=True,
        )
        duration_sec = round(time.time() - t_start, 2)
        signals = scrape_status_bar(agent_name)

        time.sleep(2)
        # Extract usage from session JSONL
        if not session_path:
            try:
                agent_meta = json.loads(subprocess.check_output(["herdr", "agent", "get", agent_name]))
                sess = agent_meta.get("result", {}).get("agent", {}).get("agent_session")
                if sess and isinstance(sess, dict) and sess.get("value"):
                    session_path = sess["value"]
            except Exception:
                pass

        usage = extract_last_turn_usage(session_path) if session_path else {}
        input_tokens = usage.get("input", 0)
        cache_read = usage.get("cacheRead", 0)
        total_context = input_tokens + cache_read
        output_tokens = usage.get("output", 0)
        reasoning_tokens = usage.get("reasoning", 0)
        turn_cost = signals.get("turn_cost", 0.0)

        log(
            f"Measurement turn complete in {duration_sec}s! "
            f"Context: {total_context:,} ({signals.get('context_pct')}) | "
            f"Reasoning Tokens: {reasoning_tokens:,} | Output Tokens: {output_tokens:,} | Cost: ${turn_cost}"
        )

        # 7. Save incremental result and session file
        archived_session = os.path.join(
            REPO_ROOT, f"scripts/compaction-bench/data/sessions/session-s3-{size}-rep{rep}.jsonl"
        )
        if session_path and os.path.exists(session_path):
            shutil.copyfile(session_path, archived_session)

        run_result = {
            "label": label,
            "size": size,
            "rep": rep,
            "context_tokens": total_context,
            "context_pct": signals.get("context_pct"),
            "reasoning_tokens": reasoning_tokens,
            "output_tokens": output_tokens,
            "turn_cost": turn_cost,
            "duration_sec": duration_sec,
            "session_file": os.path.basename(archived_session),
        }
        inc_file = os.path.join(
            REPO_ROOT, f"scripts/compaction-bench/data/runs/run-2026-09-13-s3-{size}-rep{rep}.json"
        )
        with open(inc_file, "w") as f:
            json.dump(run_result, f, indent=2)

        return run_result

    finally:
        # Move pane to archive
        log(f"Moving completed pane {pane_id} to Archive tab {ARCHIVE_TAB}...")
        try:
            subprocess.run(
                ["herdr", "pane", "move", pane_id, "--tab", ARCHIVE_TAB, "--split", "down", "--no-focus"],
                check=True,
            )
        except Exception as e:
            log(f"Warning moving pane {pane_id}: {e}")

        # Cleanup worktree & sandbox
        log("Cleaning up worktree and sandbox...")
        subprocess.run(["git", "worktree", "remove", worktree_dir, "--force"], stderr=subprocess.DEVNULL)
        shutil.rmtree(worktree_dir, ignore_errors=True)
        shutil.rmtree(sandbox_dir, ignore_errors=True)


def main():
    parser = argparse.ArgumentParser(description="Context Compaction Phase 2 Runner")
    parser.add_argument("--scenario", type=int, required=True, choices=[1, 2, 3, 4, 6])
    parser.add_argument(
        "--arm",
        type=str,
        default="A-272k",
        choices=["A-50k", "A-100k", "A-150k", "A-200k", "A-272k", "A-500k", "A-1M", "A-disabled", "all"],
    )
    parser.add_argument("--size", type=str, choices=["20k", "80k", "180k", "272k"])
    parser.add_argument("--rep", type=int, choices=[1, 2, 3])
    parser.add_argument("--turns", type=int, default=None)
    parser.add_argument("--skip-idle", action="store_true")
    parser.add_argument("--resume-turn", type=int, default=None)
    parser.add_argument("--resume-pane", type=str, default=None)
    parser.add_argument("--resume-agent", type=str, default=None)
    parser.add_argument("--resume-sandbox", type=str, default=None)
    parser.add_argument("--resume-worktree", type=str, default=None)
    args = parser.parse_args()

    if args.scenario == 3:
        if args.size and args.rep:
            run_scenario_3(args.size, args.rep)
            return
        else:
            log("Scenario 3 requires --size and --rep (e.g. --size 20k --rep 2)")
            sys.exit(1)


    arms = (
        ["A-50k", "A-100k", "A-150k", "A-200k", "A-272k", "A-500k", "A-1M", "A-disabled"]
        if args.arm == "all"
        else [args.arm]
    )

    for i, arm in enumerate(arms):
        run_arm(
            args.scenario,
            arm,
            max_turns=args.turns,
            skip_idle=args.skip_idle,
            resume_turn=args.resume_turn,
            resume_pane=args.resume_pane,
            resume_agent=args.resume_agent,
            resume_sandbox=args.resume_sandbox,
            resume_worktree=args.resume_worktree,
        )
        if i < len(arms) - 1:
            log("Waiting 600s (10m) between arms for complete cache isolation...")
            time.sleep(600)


if __name__ == "__main__":
    main()
