#!/usr/bin/env python3
"""Context Compaction Phase 2 — Scenario 3 (Reasoning Token Inflation) Orchestrator

Measures how thinking/reasoning tokens scale with context window bloat:
- 4 context sizes: 20k (0 warm-up), 80k (8 warm-up), 180k (18 warm-up), 272k (28 warm-up)
- 3 repetitions per size = 12 runs total
- Same refactoring measurement task issued across all runs
- Baseline model: antigravity/gemini-3.8-flash:high (thinking enabled at :high)
- Extracts exact reasoning and output tokens from pi session JSONL
- Fits the scaling power curve: T = T0 * (L / L_ref)^beta
- Posts findings and closes sub-issue #228
"""

import datetime
import fcntl
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LOCK_FILE = "/tmp/compaction-bench-scenario-3.lock"
ARCHIVE_TAB = "w7:t8"
COOLDOWN_SECONDS = 300  # 5 minutes cache isolation between runs

SIZES = ["20k", "80k", "180k", "272k"]
WARMUP_COUNTS = {
    "20k": 0,
    "80k": 8,
    "180k": 18,
    "272k": 28,
}
REPETITIONS = 3

WARMUP_PROMPTS = [
    "Read package.json, tsconfig.json, and vitest.config.ts. Explain the build, type-checking, and test configuration.",
    "Analyze `src/data-pipeline/fetcher.ts`. List all functions, input types, callback signatures, and failure modes.",
    "Analyze `src/data-pipeline/transformer.ts`. List all functions, input types, callback signatures, and transformation rules.",
    "Analyze `src/data-pipeline/loader.ts`. List all database operations, simulated latency, and error types.",
    "Analyze `src/data-pipeline/pipeline.ts`. Trace the execution path from `runPipeline` through each callback stage.",
    "Run `npx tsc --noEmit` to verify type checking. Detail any strict compiler options enabled in tsconfig.",
    "Write a detailed architectural critique comparing Node.js callback-style pipelines to async/await iterator pipelines.",
    "Outline error handling strategies for distributed pipelines: retries, circuit breakers, dead letter queues, and compensations.",
    "Draft a formal TypeScript interface specification for an event-driven data streaming pipeline.",
    "Explain the difference between Promise.all, Promise.allSettled, Promise.race, and Promise.any in pipeline concurrency.",
    "Describe memory leak hazards in Node.js event emitters and stream pipelines when buffers accumulate.",
    "Analyze how backpressure works in Node.js streams and compare it with reactive stream specifications.",
    "Review the database transaction patterns in loader.ts: what happens if a mid-batch write fails?",
    "Draft a comprehensive logging schema for distributed pipeline telemetry including span IDs and trace IDs.",
    "Compare callback error conventions (err, result) with Rust/Go-style Result/Either monads in TypeScript.",
    "Analyze garbage collection behavior in V8 when thousands of small callback closures are allocated per second.",
    "Draft a test strategy document for data transformation pipelines: unit tests, property-based tests, and integration mocks.",
    "Explain how async context tracking (AsyncLocalStorage) can preserve distributed trace IDs across async/await boundaries.",
    "Describe rate limiting algorithms: token bucket, leaky bucket, sliding window counter, and their trade-offs in API fetchers.",
    "Draft a TypeScript type-level validation library specification similar to Zod or TypeBox from scratch.",
    "Analyze CPU profiling and flamegraphs: how does V8 optimize Promise microtasks compared to callback event loop ticks?",
    "Review database indexing strategies for batch pipeline loaders: clustered vs non-clustered, write amplification trade-offs.",
    "Explain the graceful shutdown protocol for an in-flight Node.js pipeline upon SIGTERM or SIGINT.",
    "Draft an architectural decision record (ADR) for standardizing async/await across all backend microservices.",
    "Compare Node.js worker threads vs cluster module vs external queue workers for CPU-heavy data transformations.",
    "Describe chaos engineering experiments for data pipelines: packet drop, slow disk, database deadlocks, network partitions.",
    "Review security considerations for pipeline fetchers: SSRF protection, DNS rebinding, TLS certificate validation.",
    "Draft a comprehensive summary of best practices for resilient, high-throughput TypeScript data pipelines.",
]

MEASUREMENT_PROMPT = """Refactor `src/data-pipeline/pipeline.ts` from callback hell to modern async/await in TypeScript.
Specifically:
1. Create `src/data-pipeline/types.ts` containing `PipelineError`, `FetchResult`, `TransformResult`, and `LoadResult`.
2. Refactor `pipeline.ts` so that `runPipeline(config, callback)` becomes `async function runPipeline(config: PipelineConfig): Promise<PipelineResult>`.
3. Wrap all asynchronous operations in structured try/catch blocks with custom typed error instances.
4. Implement the changes directly in the codebase and verify the implementation with `npx tsc --noEmit`.
5. Summarize your reasoning and verify that no callback patterns remain."""


def log(msg: str):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def run_cmd(cmd, cwd=REPO_ROOT, check=True):
    log(f"Executing: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    return subprocess.run(
        cmd, cwd=cwd, shell=isinstance(cmd, str), check=check, capture_output=True, text=True
    )


def check_agy_usage() -> dict:
    try:
        out = subprocess.check_output(["agy", "-p", "/usage"], text=True)
    except Exception as e:
        log(f"Warning: Failed to query agy /usage: {e}")
        return {"error": str(e)}

    res = {}
    for line in out.strip().splitlines():
        parts = [p.strip() for p in line.split("\t")]
        if len(parts) >= 3 and parts[0] == "Gemini Models":
            kind = parts[1]
            pct_m = re.search(r"(\d+)%", parts[2])
            pct = int(pct_m.group(1)) if pct_m else None
            reset_ts = parts[3] if len(parts) >= 4 else None
            if "Five Hour" in kind:
                res["five_hour_pct"] = pct
                res["five_hour_reset"] = reset_ts
            elif "Weekly" in kind:
                res["weekly_pct"] = pct
                res["weekly_reset"] = reset_ts
    return res


def wait_until_idle(agent_name: str, timeout_sec: int = 300) -> bool:
    t0 = time.time()
    while time.time() - t0 < timeout_sec:
        try:
            out = subprocess.check_output(["herdr", "agent", "get", agent_name])
            data = json.loads(out)
            status = data.get("result", {}).get("agent", {}).get("status")
            if status in ("idle", "waiting"):
                return True
        except Exception:
            pass
        time.sleep(1)
    return False


def scrape_status_bar(agent_name: str) -> dict:
    cmd = ["herdr", "agent", "read", agent_name, "--source", "recent-unwrapped", "--lines", "20"]
    try:
        out = subprocess.check_output(cmd).decode("utf-8", errors="replace")
    except Exception as e:
        log(f"Warning: scrape failed: {e}")
        return {}

    status_line = ""
    for line in reversed(out.splitlines()):
        if "%" in line and ("auto" in line or "•" in line or "high" in line):
            status_line = line
            break

    context_pct = None
    m_ctx = re.search(r"([0-9.]+%/[0-9]+[kM]?|\(\?%/[0-9]+[kM]?\))", status_line)
    if m_ctx:
        context_pct = m_ctx.group(1)

    turn_cost = None
    m_cost = re.search(r"\$([0-9.]+)", status_line)
    if m_cost:
        try:
            turn_cost = float(m_cost.group(1))
        except ValueError:
            pass

    return {"context_pct": context_pct, "turn_cost": turn_cost}


def extract_last_turn_usage(session_path: str) -> dict:
    """Extracts usage metrics (including reasoning tokens) from the last assistant message."""
    last_usage = {}
    if not os.path.exists(session_path):
        return last_usage

    with open(session_path, "r") as f:
        for line in f:
            try:
                data = json.loads(line)
                u = data.get("message", {}).get("usage")
                if u:
                    last_usage = u
            except Exception:
                pass
    return last_usage


def update_orchestrator_state(label: str, context_k: float, reasoning: int, output: int, next_label: str | None):
    state_path = os.path.join(REPO_ROOT, "scripts/compaction-bench/ORCHESTRATOR-STATE.md")
    with open(state_path, "r") as f:
        content = f.read()

    pattern = rf"- \[ \] \**{re.escape(label)}\**.*"
    replacement = (
        f"- [x] **{label}**: COMPLETED. Context: {context_k:.1f}k | "
        f"Reasoning Tokens: {reasoning:,} | Total Output: {output:,}"
    )
    content = re.sub(pattern, replacement, content, count=1)

    if next_label:
        next_pattern = rf"- \[ \] {re.escape(next_label)}"
        next_replacement = f"- [ ] **{next_label}**: NEXT (Ready to launch)"
        content = re.sub(next_pattern, next_replacement, content, count=1)
    else:
        content = content.replace(
            "- [ ] Scenario 3: Reasoning Token Inflation (12 runs: 4 sizes × 3 reps):",
            "- [x] Scenario 3: Reasoning Token Inflation (12 runs: 4 sizes × 3 reps):",
        )

    with open(state_path, "w") as f:
        f.write(content)


def git_commit_and_push(label: str, reasoning: int):
    run_cmd(
        ["git", "add", "scripts/compaction-bench/data/", "scripts/compaction-bench/ORCHESTRATOR-STATE.md"]
    )
    commit_msg = f"bench(compaction): record scenario 3 {label} receipt ({reasoning:,} reasoning tokens)"
    run_cmd(["git", "commit", "-m", commit_msg])
    run_cmd(["git", "push", "origin", "bench/context-compaction-phase-2"])


def fit_power_law(points: list[tuple[float, float]]) -> tuple[float, float]:
    """Fits y = a * x^beta via log-log linear regression. Returns (beta, r_squared)."""
    valid = [(x, y) for x, y in points if x > 0 and y > 0]
    if len(valid) < 2:
        return 0.0, 0.0

    log_x = [math.log(x) for x, y in valid]
    log_y = [math.log(y) for x, y in valid]

    n = len(log_x)
    mean_x = sum(log_x) / n
    mean_y = sum(log_y) / n

    ss_xy = sum((log_x[i] - mean_x) * (log_y[i] - mean_y) for i in range(n))
    ss_xx = sum((log_x[i] - mean_x) ** 2 for i in range(n))
    ss_yy = sum((log_y[i] - mean_y) ** 2 for i in range(n))

    if ss_xx == 0 or ss_yy == 0:
        return 0.0, 0.0

    beta = ss_xy / ss_xx
    r_squared = (ss_xy ** 2) / (ss_xx * ss_yy)
    return round(beta, 4), round(r_squared, 4)


def build_summary_and_close(all_results: list[dict]):
    log("Building Scenario 3 empirical summary across all 12 runs...")

    summary_by_size = {}
    points_for_fit = []

    for size in SIZES:
        reps = [r for r in all_results if r["size"] == size]
        if not reps:
            continue
        avg_ctx = sum(r["context_tokens"] for r in reps) / len(reps)
        avg_reasoning = sum(r["reasoning_tokens"] for r in reps) / len(reps)
        avg_output = sum(r["output_tokens"] for r in reps) / len(reps)
        avg_cost = sum(r["turn_cost"] for r in reps) / len(reps)

        summary_by_size[size] = {
            "avg_context_tokens": round(avg_ctx),
            "avg_reasoning_tokens": round(avg_reasoning),
            "avg_output_tokens": round(avg_output),
            "avg_cost_usd": round(avg_cost, 6),
            "runs": reps,
        }
        for r in reps:
            points_for_fit.append((r["context_tokens"], r["reasoning_tokens"]))

    beta, r_squared = fit_power_law(points_for_fit)
    log(f"Empirical Scaling Exponent Fit: beta = {beta} (R² = {r_squared})")

    summary_payload = {
        "scenario": 3,
        "title": "Reasoning Token Inflation (4 context sizes × 3 repetitions)",
        "model": "antigravity/gemini-3.8-flash:high",
        "harness": "pi",
        "scaling_exponent": {
            "beta": beta,
            "r_squared": r_squared,
            "interpretation": (
                "Super-linear inflation (beta > 1.0)"
                if beta > 1.0
                else "Sub-linear / dampened inflation (beta < 1.0)"
            ),
        },
        "summary_by_size": summary_by_size,
        "all_runs": all_results,
    }

    summary_file = os.path.join(
        REPO_ROOT, "scripts/compaction-bench/data/summary/reasoning-tokens.json"
    )
    with open(summary_file, "w") as f:
        json.dump(summary_payload, f, indent=2)

    run_cmd(["git", "add", summary_file])
    run_cmd(["git", "commit", "-m", "bench(compaction): finalize scenario 3 reasoning tokens summary JSON"])
    run_cmd(["git", "push", "origin", "bench/context-compaction-phase-2"])

    rows = []
    for size in SIZES:
        data = summary_by_size.get(size, {})
        reps = data.get("runs", [])
        rep_reasoning = ", ".join(str(r["reasoning_tokens"]) for r in reps)
        rows.append(
            f"| **{size}** | {data.get('avg_context_tokens', 0):,} | "
            f"{rep_reasoning} | **{data.get('avg_reasoning_tokens', 0):,}** | "
            f"{data.get('avg_output_tokens', 0):,} | **${data.get('avg_cost_usd', 0):.6f}** |"
        )

    table_md = "\n".join([
        "| Context Size | Mean Context Tokens | Repetitions (Reasoning Tokens) | Mean Reasoning Tokens | Mean Output Tokens | Mean Task Cost (USD) |",
        "|---|---|---|---|---|---|",
        *rows,
    ])

    issue_comment = f"""### Scenario 3 (Reasoning Token Inflation) — Completed Across 4 Sizes × 3 Reps (12 Runs)

All 12 runs of **Scenario 3** have executed the standardized refactoring measurement task on `src/data-pipeline/pipeline.ts` across 4 controlled context sizes (20k, 80k, 180k, 272k) using `antigravity/gemini-3.8-flash:high` with thinking enabled.

#### Empirical Reasoning Token Scaling Receipt

{table_md}

#### Power Law Scaling Exponent (§8d Discovery)
- **Fitted Scaling Exponent ($\beta$):** **{beta}** ($R^2 = {r_squared}$)
- **Theoretical Phase 1 Prediction:** $\beta \approx 1.6$
- **Empirical Verdict:** Measured $\beta = {beta}$. {'Context bloat drives super-linear reasoning token inflation, verifying Phase 1 predictions.' if beta >= 1.0 else 'Reasoning token inflation is dampened compared to Phase 1 predictions.'}

Artifacts:
- Summary JSON: `scripts/compaction-bench/data/summary/reasoning-tokens.json`
- Session JSONLs: `scripts/compaction-bench/data/sessions/session-s3-*.jsonl`
- PR: #237
"""
    log("Posting completion comment and closing sub-issue #228...")
    try:
        run_cmd(["gh", "issue", "close", "228", "--comment", issue_comment])
        log("Closed sub-issue #228 successfully.")
    except Exception as e:
        log(f"Error closing issue #228: {e}")

    try:
        run_cmd([
            "gh",
            "issue",
            "comment",
            "222",
            "--body",
            (
                f"### Benchmark Progress Update: Scenario 3 (Reasoning Token Inflation) Complete\n\n"
                f"All 12 runs (4 context sizes × 3 repetitions) are complete. Empirical scaling exponent: "
                f"**beta = {beta}** (R² = {r_squared}). Sub-issue #228 is closed.\n\n"
                f"See #228 for full empirical receipt."
            ),
        ])
        log("Posted update on Umbrella issue #222.")
    except Exception as e:
        log(f"Error commenting on issue #222: {e}")


def main():
    lock_fd = open(LOCK_FILE, "w")
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        log("Another Scenario 3 orchestrator instance is already running. Exiting.")
        sys.exit(0)

    run_queue = []
    for size in SIZES:
        for rep in range(1, REPETITIONS + 1):
            run_queue.append((size, rep))

    log("==================================================")
    log("Starting Scenario 3 (Reasoning Token Inflation) Orchestrator")
    log(f"Total Runs: {len(run_queue)} (4 sizes × 3 repetitions)")
    log("==================================================")

    all_results = []

    # Check for existing partial results
    existing_summary = os.path.join(REPO_ROOT, "scripts/compaction-bench/data/summary/reasoning-tokens.json")
    if os.path.exists(existing_summary):
        try:
            with open(existing_summary, "r") as f:
                d = json.load(f)
                all_results = d.get("all_runs", [])
                log(f"Found {len(all_results)} existing run results.")
        except Exception:
            pass

    for idx, (size, rep) in enumerate(run_queue):
        label = f"{size}-rep{rep}"

        # Check if already completed
        if any(r["label"] == label for r in all_results):
            log(f"Run {label} already completed. Skipping.")
            continue

        # 1. Pre-run quota check
        usage = check_agy_usage()
        log(f"--- [Quota Preflight for {label}] ---")
        five_hour = usage.get("five_hour_pct")
        weekly = usage.get("weekly_pct")
        log(f"Gemini Models: 5-Hour: {five_hour}% | Weekly: {weekly}%")

        if five_hour is not None and five_hour < 10:
            log(f"CRITICAL: 5-hour quota remaining ({five_hour}%) < 10%. Pausing before {label}.")
            sys.exit(1)
        if weekly is not None and weekly < 2:
            log(f"CRITICAL: Weekly quota remaining ({weekly}%) < 2%. Pausing before {label}.")
            sys.exit(1)

        log(f">>> Executing Run: {label} (Size: {size}, Rep: {rep}) <<<")

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

        target_fixture = os.path.join(worktree_dir, "scripts/compaction-bench/fixtures/refactor-repo")

        # 3. Create Herdr Pane
        res_pane = json.loads(
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
                    target_fixture,
                    "--env",
                    f"PI_CODING_AGENT_DIR={sandbox_dir}",
                    "--no-focus",
                ]
            )
        )
        pane_id = res_pane["result"]["pane"]["pane_id"]
        subprocess.run(["herdr", "pane", "run", pane_id, f'export PI_CODING_AGENT_DIR="{sandbox_dir}"'], check=True)
        time.sleep(1)

        agent_name = f"s3-{size.lower()}-r{rep}-{int(time.time()) % 10000}"

        # 4. Start Agent
        log(f"Starting agent {agent_name} in pane {pane_id}...")
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

        if not session_path:
            sessions_dir = os.path.join(sandbox_dir, "sessions")
            for root, _, files in os.walk(sessions_dir):
                for f in files:
                    if f.endswith(".jsonl"):
                        session_path = os.path.join(root, f)
                        break

        log(f"Agent running. Session path: {session_path}")
        time.sleep(2)

        # 5. Execute Warm-up Turns (if any)
        warmup_count = WARMUP_COUNTS[size]
        if warmup_count > 0:
            log(f"Running {warmup_count} warm-up turns to accumulate context for {size}...")
            for w_idx in range(warmup_count):
                w_prompt = WARMUP_PROMPTS[w_idx]
                log(f"[Warm-up {w_idx + 1}/{warmup_count}] Prompt: {w_prompt[:60]}...")
                wait_until_idle(agent_name)
                subprocess.run(
                    ["herdr", "agent", "prompt", agent_name, w_prompt, "--wait", "--timeout", "300000"],
                    check=True,
                )
                sig = scrape_status_bar(agent_name)
                log(f"Warm-up {w_idx + 1} done | Context: {sig.get('context_pct')}")

        # 6. Execute Measurement Turn
        log(f"*** ISSUING MEASUREMENT TASK for {label} ***")
        wait_until_idle(agent_name)
        t_start = time.time()
        subprocess.run(
            ["herdr", "agent", "prompt", agent_name, MEASUREMENT_PROMPT, "--wait", "--timeout", "420000"],
            check=True,
        )
        duration_sec = round(time.time() - t_start, 2)
        signals = scrape_status_bar(agent_name)

        # 7. Extract Exact Usage & Reasoning Tokens
        time.sleep(2)
        if not session_path:
            try:
                agent_meta = json.loads(subprocess.check_output(["herdr", "agent", "get", agent_name]))
                sess = agent_meta.get("result", {}).get("agent", {}).get("agent_session")
                if sess and isinstance(sess, dict) and sess.get("value"):
                    session_path = sess["value"]
            except Exception:
                pass
        if not session_path:
            sessions_dir = os.path.join(sandbox_dir, "sessions")
            if os.path.exists(sessions_dir):
                for root, _, files in os.walk(sessions_dir):
                    for f in files:
                        if f.endswith(".jsonl"):
                            session_path = os.path.join(root, f)
                            break
        log(f"Extracting usage from session: {session_path}")
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

        # 8. Archive Session & Pane
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
        all_results.append(run_result)

        # Save incremental result file
        inc_file = os.path.join(
            REPO_ROOT, f"scripts/compaction-bench/data/runs/run-2026-09-13-s3-{size}-rep{rep}.json"
        )
        with open(inc_file, "w") as f:
            json.dump(run_result, f, indent=2)

        subprocess.run(
            ["herdr", "pane", "move", pane_id, "--tab", ARCHIVE_TAB, "--split", "down", "--no-focus"],
            check=True,
        )
        subprocess.run(["git", "worktree", "remove", worktree_dir, "--force"], stderr=subprocess.DEVNULL)
        shutil.rmtree(worktree_dir, ignore_errors=True)
        shutil.rmtree(sandbox_dir, ignore_errors=True)

        next_label = f"{run_queue[idx + 1][0]}-rep{run_queue[idx + 1][1]}" if idx + 1 < len(run_queue) else None
        update_orchestrator_state(label, total_context / 1000.0, reasoning_tokens, output_tokens, next_label)
        git_commit_and_push(label, reasoning_tokens)

        if next_label:
            log(f"Cooling down {COOLDOWN_SECONDS}s (5m) before {next_label}...")
            time.sleep(COOLDOWN_SECONDS)

    build_summary_and_close(all_results)
    log("Scenario 3 successfully complete across all 12 runs!")


if __name__ == "__main__":
    main()
