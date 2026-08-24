import { createHash, randomUUID } from "node:crypto";
import { appendFileSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative, resolve, sep } from "node:path";
import { validateRecord } from "./ledger.ts";
import { validateAttempt, type Attempt } from "./r2-contract.ts";

const mode = process.argv[2];
if (!['--pilot','--full'].includes(mode)) throw new Error("usage: r2-run.ts --pilot|--full <append-only-output-dir>");
const root = resolve(import.meta.dirname, "../.."); const data = join(import.meta.dirname, "data/r2"); const bundle = join(import.meta.dirname, "r2-bundle");
const out = resolve(process.argv[3] ?? ".r2-local/runs"); const manifest = JSON.parse(readFileSync(join(data, "execution-manifest.json"), "utf8"));
const matrix = JSON.parse(readFileSync(join(data, "task-matrix.json"), "utf8")); const order = JSON.parse(readFileSync(join(data, "run-order.json"), "utf8"));
const harnessBundle = resolve(process.env.R2_HARNESS_BUNDLE ?? ""); const providerNetwork = process.env.R2_DOCKER_PROVIDER_NETWORK ?? "";
const credential = join(process.env.HOME ?? "", ".claude/.credentials.json");
const preflight = spawnSync("npx", ["tsx", join(import.meta.dirname, "r2-preflight.ts")], { cwd: root, env: process.env, encoding: "utf8" });
process.stdout.write(preflight.stdout); process.stderr.write(preflight.stderr); if (preflight.status !== 0) throw new Error("preflight failed closed; zero attempts launched");
if (mode === '--full' && !existsSync(join(out, "PILOT-PROMOTED"))) throw new Error("full matrix blocked: missing PILOT-PROMOTED evidence");
mkdirSync(join(out, "attempts"), { recursive: true });
const shard = join(out, mode === '--pilot' ? "attempts-pilot.jsonl" : "attempts-full.jsonl");
const ledger = join(out, mode === '--pilot' ? "ledger-pilot.jsonl" : "ledger-full.jsonl");
const pilotTasks = new Set(matrix.controlPilot.taskIds); const pilotLoadouts = new Set(matrix.controlPilot.loadoutIds); const pilotRepeats = new Set(matrix.controlPilot.repeatIndices);
const isPilotCell = (c:any) => pilotTasks.has(c.taskId) && pilotLoadouts.has(c.loadoutId) && pilotRepeats.has(c.repeatIndex);
const cells = order.cells.filter((c:any) => mode === '--pilot' ? isPilotCell(c) : !isPilotCell(c));

function hashTree(dir:string):string { const h=createHash('sha256'); let files=0; const walk=(d:string)=>{for(const name of readdirSync(d).sort()){const p=join(d,name),s=lstatSync(p);if(s.isDirectory())walk(p);else if(s.isFile()){h.update(relative(dir,p).split(sep).join('/'));h.update('\0');h.update(readFileSync(p));h.update('\0');files++;}else throw new Error(`unsupported artifact entry ${p}`);}};walk(dir);if(!files)h.update('empty');return h.digest('hex'); }
function appendAttempt(a:Attempt){validateAttempt(a);appendFileSync(shard,JSON.stringify(a)+'\n',{flag:'a'});}
function docker(args:string[], log:string){const r=spawnSync('docker',args,{encoding:'utf8',maxBuffer:64*1024*1024});writeFileSync(log,JSON.stringify({command:['docker',...args],status:r.status,signal:r.signal,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');return r;}

for(const cell of cells){
  const task=matrix.tasks.find((t:any)=>t.taskId===cell.taskId), loadout=task.loadouts.find((l:any)=>l.id===cell.loadoutId);
  const cellKey=`${cell.order.toString().padStart(3,'0')}-${task.slot}-${loadout.id}-r${cell.repeatIndex}`; const attemptDir=join(out,'attempts',cellKey);
  if(existsSync(attemptDir)) throw new Error(`append-only refusal: ${attemptDir} already exists`); mkdirSync(attemptDir,{recursive:false});
  const work=join(attemptDir,'work');cpSync(join(bundle,task.fixture),work,{recursive:true});mkdirSync(join(work,'output'),{recursive:true});
  const skillArgs:string[]=[]; const recordSkillArgs:string[]=[];
  if(loadout.arm==='placebo') skillArgs.push('--posture','floor');
  else if(['low','med'].includes(loadout.rung)){skillArgs.push('--posture','curated');for(const id of loadout.skills){const identity=matrix.tasks.find((t:any)=>t.targetSkillId===id);skillArgs.push('--skill',`/bundle/skills/${identity.slot}`);}}
  else { const plugin=join(work,'loadout-plugin');mkdirSync(join(plugin,'.claude-plugin'),{recursive:true});writeFileSync(join(plugin,'.claude-plugin','plugin.json'),JSON.stringify({name:'r2-loadout',version:'0.0.0'})+'\n');for(const id of loadout.skills){const identity=matrix.tasks.find((t:any)=>t.targetSkillId===id);cpSync(join(bundle,'skills',identity.slot),join(plugin,'skills',identity.slot),{recursive:true});recordSkillArgs.push('--record-skill',`/work/loadout-plugin/skills/${identity.slot}`);}skillArgs.push('--posture','product-floor','--door-plugin-dir','/work/loadout-plugin');}
  const prompt=`${task.taskPrompt}\n\nRead TASK.md and fixture.json in the current working directory. Complete the task by writing the required output/ files. Do not use network access. Do not alter fixture.json or evaluators/.`;
  const runtimeRecord=join(work,'runtime-record.json'), receipt=join(work,'runtime-receipt.json'); const startedAt=new Date().toISOString();
  const runtimeArgs=['run','--rm','--platform',manifest.sandbox.platform,'--network',providerNetwork,'-e','HOME=/root','-v',`${work}:/work`,'-v',`${bundle}:/bundle:ro`,'-v',`${harnessBundle}:/harness:ro`,'-v',`${credential}:/root/.claude/.credentials.json:ro`,'-w','/work',manifest.sandbox.image,'node','/bundle/runtime-dist/skill-zero.mjs','--record','--benchmark-id',matrix.benchmarkId,'--task',task.taskId,'--arm',loadout.arm,'--rung',loadout.rung,'--repeat',String(cell.repeatIndex),'--harness','claude','--model',manifest.model.snapshot,'-p',prompt,'--record-out','/work/runtime-record.json','--receipt-out','/work/runtime-receipt.json','--harness-bundle','/harness','--harness-entry',manifest.harness.entry,'--harness-version',manifest.harness.version,'--harness-sha256',manifest.harness.bundleTreeSha256,...skillArgs,...recordSkillArgs,'--','--dangerously-skip-permissions'];
  const run=docker(runtimeArgs,join(attemptDir,'harness-log.json')); const finishedAt=new Date().toISOString();
  if(run.status!==0||!existsSync(runtimeRecord)||!existsSync(receipt)){const artifactSha256=hashTree(attemptDir);appendAttempt({schema:'hh-r2-attempt/v1',attemptId:randomUUID(),taskId:task.taskId,loadoutId:loadout.id,repeatIndex:cell.repeatIndex,attemptIndex:0,startedAt,finishedAt,status:'invalid',invalidReason:run.status===125?'sandbox-setup':'harness-crash',artifactSha256,ledgerRecordSha256:null});continue;}
  // Evaluator code and expected artifacts enter only after the model process exits.
  cpSync(join(bundle,'evaluators'),join(work,'evaluators'),{recursive:true});
  const evaluator=docker(['run','--rm','--platform',manifest.sandbox.platform,'--network','none','-v',`${work}:/work`,'-w','/work',manifest.sandbox.image,'/bin/sh','-lc',task.endpoint.command],join(attemptDir,'evaluator-log.json'));
  if(evaluator.status===125||evaluator.status===126||evaluator.status===127){const artifactSha256=hashTree(attemptDir);appendAttempt({schema:'hh-r2-attempt/v1',attemptId:randomUUID(),taskId:task.taskId,loadoutId:loadout.id,repeatIndex:cell.repeatIndex,attemptIndex:0,startedAt,finishedAt:new Date().toISOString(),status:'invalid',invalidReason:'endpoint-infrastructure',artifactSha256,ledgerRecordSha256:null});continue;}
  const record=JSON.parse(readFileSync(runtimeRecord,'utf8'));record.objectiveEndpoint={kind:task.endpoint.kind,pass:evaluator.status===0,detail:`pinned evaluator exit ${evaluator.status}`};validateRecord(record);const recordBody=JSON.stringify(record)+'\n';const ledgerRecordSha256=createHash('sha256').update(recordBody).digest('hex');writeFileSync(join(attemptDir,'validated-ledger-record.json'),recordBody);appendFileSync(ledger,recordBody,{flag:'a'});const artifactSha256=hashTree(attemptDir);
  appendAttempt({schema:'hh-r2-attempt/v1',attemptId:randomUUID(),taskId:task.taskId,loadoutId:loadout.id,repeatIndex:cell.repeatIndex,attemptIndex:0,startedAt,finishedAt:new Date().toISOString(),status:'valid',invalidReason:null,artifactSha256,ledgerRecordSha256});
}
if(mode==='--pilot'){
  const attempts=readFileSync(shard,'utf8').split('\n').filter(Boolean).map(JSON.parse); const records=readFileSync(ledger,'utf8').split('\n').filter(Boolean).map(JSON.parse);
  const positive=records.filter((r:any)=>r.arm!=='placebo'&&r.notes?.includes('rung=low.'));
  const integrity=attempts.length===30&&attempts.every((a:any)=>a.status==='valid')&&records.length===30&&records.filter((r:any)=>r.arm==='placebo').every((r:any)=>r.skillsLoaded.length===0)&&positive.length===10&&positive.every((r:any)=>r.objectiveEndpoint.pass===true);
  if(!integrity) throw new Error('control pilot stop rule fired: no PILOT-PROMOTED marker written');
  writeFileSync(join(out,'PILOT-ENDPOINTS-PASSED'),JSON.stringify({schema:'hh-r2-pilot-endpoints/v1',attempts:attempts.length,ledgerRecords:records.length,positiveControlPasses:positive.length,attemptShardSha256:createHash('sha256').update(readFileSync(shard)).digest('hex'),ledgerShardSha256:createHash('sha256').update(readFileSync(ledger)).digest('hex')},null,2)+'\n',{flag:'wx'});
}
console.log(JSON.stringify({mode,cells:cells.length,attemptShard:shard,ledgerShard:ledger},null,2));
