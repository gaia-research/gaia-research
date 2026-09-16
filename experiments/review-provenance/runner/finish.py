#!/usr/bin/env python3
"""Evaluate one interactive arm and write its run record.
Usage: finish.py <run_dir> <id> <arm> <rep> <started> <ended> <taskroot> <model> <ev_dir> <treat_dir> <launch_json>
"""
import sys, json, hashlib, glob, os, subprocess, shutil

run, id_, arm, rep, started, ended, taskroot, model, ev, treat, launch = sys.argv[1:]
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest() if p and os.path.exists(p) else None

shutil.copy(f"{taskroot}/installability.ts", f"{run}/result.ts")
root = os.path.abspath(f"{ev}/../..")
p = subprocess.run(["node", "--experimental-strip-types", "experiments/review-provenance/evaluator.mjs",
                    "--task", f"{run}/result.ts"], cwd=root, capture_output=True, text=True,
                   env={**os.environ, "NODE_NO_WARNINGS": "1"})
open(f"{run}/eval.json", "w").write(p.stdout)
try:
    checks = json.loads(p.stdout).get("checks") or []
    failed = [c.get("id") for c in checks if not (c.get("passed") or c.get("pass"))]
except Exception:
    failed = None

files = sorted(os.path.relpath(os.path.join(d, f), taskroot)
               for d, _, fs in os.walk(taskroot) for f in fs)
sessions = sorted(glob.glob(f"{run}/session/**/*.jsonl", recursive=True))
usage, stops, reads, model_seen, thinking_seen = [], [], [], None, None
for s in sessions:
    for line in open(s):
        try:
            o = json.loads(line)
        except Exception:
            continue
        if o.get("type") == "model_change":
            model_seen = f'{o.get("provider")}/{o.get("modelId")}'
        if o.get("type") == "thinking_level_change":
            thinking_seen = o.get("thinkingLevel")
        m = o.get("message") or {}
        if m.get("role") == "assistant":
            stops.append(m.get("stopReason"))
            if m.get("usage"):
                u = m["usage"]
                usage.append({k: u.get(k) for k in ("input", "output", "cacheRead", "cacheWrite", "totalTokens")})
            for c in m.get("content") or []:
                if c.get("type") in ("toolCall", "tool_use") and c.get("name") == "read":
                    path = str((c.get("arguments") or c.get("input") or {}).get("path", ""))
                    reads.append("TREATMENT_SKILL" if (path.startswith(treat) or path.endswith("treatment/SKILL.md")) else os.path.basename(path))

treat_file = f"{treat}/SKILL.md"
rec = {
    "schema": "gaia.research-arbor-review-provenance-run/v1",
    "id": id_, "mode": "interactive", "arm": arm, "replication": int(rep),
    "startedAt": started, "endedAt": ended,
    "harness": {"name": "pi", "door": "pi-zero",
                "version": subprocess.run(["pi", "--version"], capture_output=True, text=True).stdout.strip(),
                "launch": json.loads(launch)},
    "model": {"requested": model, "observedInSession": model_seen, "observedThinkingLevel": thinking_seen},
    "treatmentDelivery": ({"method": "pi-zero --level low --skill (native listing, body read on demand)",
                           "sha256": sha(treat_file), "bytes": os.path.getsize(treat_file),
                           "bodyReadInSession": "TREATMENT_SKILL" in reads} if arm == "treatment" else None),
    "sessionFiles": [os.path.relpath(s, run) for s in sessions],
    "sessionLogSha256": [sha(s) for s in sessions],
    "assistantUsage": usage,
    "stopReasons": stops,
    "readTargets": reads,
    "taskRootFiles": files,
    "artifacts": {"taskInSha256": sha(f"{ev}/task/installability.ts"), "resultSha256": sha(f"{run}/result.ts"),
                  "promptSha256": sha(f"{run}/prompt.txt"), "evaluatorSha256": sha(f"{ev}/evaluator.mjs"),
                  "fixtureSha256": sha(f"{ev}/fixture.json")},
    "evaluation": {"exit": p.returncode, "failedChecks": failed},
}
json.dump(rec, open(f"{run}/record.json", "w"), indent=2)
print(json.dumps({"id": id_, "model": model_seen, "thinking": thinking_seen, "turns": len(usage),
                  "firstInput": usage[0]["input"] if usage else None, "lastStop": stops[-1] if stops else None,
                  "reads": reads, "files": files, "eval": rec["evaluation"]}))
