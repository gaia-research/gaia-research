import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
export type Cell = { taskId:string; loadoutId:string; repeatIndex:number; taskPrompt:string; arm:string; rung:string; skills:string[] };
export type ExecutionResult = { status:"completed"|"timeout"|"crash"; exitCode:number|null; signal:string|null; stdout:string; stderr:string; artifactPath:string; artifactSha256:string; wallClockMs:number };
export function enumerateCells(matrix:any,repeats:number):Cell[]{ if(!Number.isInteger(repeats)||repeats<1)throw new Error("repeats must be a positive integer"); if(!matrix||!Array.isArray(matrix.tasks))throw new Error("matrix.tasks must be an array"); const out:Cell[]=[]; for(const t of matrix.tasks){if(!t.taskId||!t.taskPrompt||!Array.isArray(t.loadouts))throw new Error(`invalid task ${t.taskId??"?"}`);for(const l of t.loadouts){if(!l.id||!l.arm||!l.rung||!Array.isArray(l.skills))throw new Error(`invalid loadout in ${t.taskId}`);for(let r=0;r<repeats;r++)out.push({taskId:t.taskId,loadoutId:l.id,repeatIndex:r,taskPrompt:t.taskPrompt,arm:l.arm,rung:l.rung,skills:[...l.skills]});}}return out; }
export function createSandbox(prefix="hh-r2-"){return mkdtempSync(join(tmpdir(),prefix));}
export function writeSandboxInput(dir:string,cell:Cell){mkdirSync(dir,{recursive:true});const p=join(dir,"input.json");writeFileSync(p,JSON.stringify({taskId:cell.taskId,prompt:cell.taskPrompt,loadoutId:cell.loadoutId,skills:cell.skills},null,2)+"\n",{mode:0o600});return p;}
/** Run skill-zero with an explicit record destination and TERM→KILL escalation. */
export async function runSkillZero(command: string, args: string[], o: { cwd: string; recordPath: string; timeoutMs?: number; killGraceMs?: number; env?: NodeJS.ProcessEnv }): Promise<ExecutionResult> {
  if (args.includes("--record") || args.includes("--record-out")) throw new Error("controller owns --record-out");
  const started = Date.now();
  return await new Promise(resolve => {
    const child = spawn(command, [...args, "--record-out", o.recordPath], { cwd: o.cwd, env: { ...process.env, ...o.env }, shell: false });
    let stdout = "", stderr = "", timedOut = false, killed = false; let killTimer: NodeJS.Timeout | undefined;
    child.stdout.on("data", d => stdout += d); child.stderr.on("data", d => stderr += d);
    const timer = setTimeout(() => { timedOut = true; child.kill("SIGTERM"); killTimer = setTimeout(() => { killed = true; child.kill("SIGKILL"); }, o.killGraceMs ?? 5000); }, o.timeoutMs ?? 1800000);
    child.on("close", (exitCode, signal) => { clearTimeout(timer); if (killTimer) clearTimeout(killTimer); let artifact = ""; try { artifact = readFileSync(o.recordPath, "utf8"); } catch { }
      resolve({ status: timedOut ? "timeout" : exitCode === 0 ? "completed" : "crash", exitCode, signal: killed ? "SIGKILL" : signal, stdout, stderr, artifactPath: o.recordPath, artifactSha256: artifact ? createHash("sha256").update(artifact).digest("hex") : "", wallClockMs: Date.now() - started }); });
    child.on("error", e => { clearTimeout(timer); if (killTimer) clearTimeout(killTimer); resolve({ status: "crash", exitCode: null, signal: null, stdout, stderr: stderr + String(e), artifactPath: o.recordPath, artifactSha256: "", wallClockMs: Date.now() - started }); });
  });
}
