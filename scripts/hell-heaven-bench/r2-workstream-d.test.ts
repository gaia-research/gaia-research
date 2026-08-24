import { describe, expect, it } from "vitest";
import { enumerateCells } from "./r2-execution";
import { appendShard, detectCells, validateAttempt } from "./r2-collection";
import { analyse } from "./r2-analysis";
import { validateClaims } from "./r2-gates";
const matrix={tasks:[{taskId:"t1",taskPrompt:"x",loadouts:[{id:"placebo",arm:"placebo",rung:"zero",skills:[]},{id:"heaven-low",arm:"heaven",rung:"low",skills:["s1"]}]}]};
const attempt=(repeatIndex:number, hash:string)=>({schema:"hh-r2-attempt/v1",attemptId:`a${repeatIndex}`,taskId:"t1",loadoutId:"placebo",repeatIndex,attemptIndex:0,startedAt:"2026-01-01T00:00:00Z",finishedAt:"2026-01-01T00:00:01Z",status:"valid",invalidReason:null,artifactSha256:hash,ledgerRecordSha256:"a".repeat(64)} as const);
describe("R2 Workstream D machinery",()=>{
 it("enumerates every preregistered cell and repeat, without count semantics",()=>expect(enumerateCells(matrix,5)).toHaveLength(10));
 it("rejects duplicate or incomplete collections",()=>{const xs=[attempt(0,"0".repeat(64)),attempt(0,"1".repeat(64))];expect(detectCells(xs,[{taskId:"t1",loadoutId:"placebo",repeatIndex:0},{taskId:"t1",loadoutId:"placebo",repeatIndex:1}])).toMatchObject({complete:false,duplicates:["t1\u0000placebo\u00000"]});});
 it("keeps invalid attempts out of receipts",()=>expect(()=>validateAttempt({...attempt(0,"0".repeat(64)),status:"invalid",invalidReason:"harness-crash",ledgerRecordSha256:null})).not.toThrow());
 it("analysis keeps dose categories distinct and has no fabricated correlation",()=>{const r:any={schema:"hh-ledger/v1",recordedAt:"2026-01-01T00:00:00Z",benchmarkId:"b",task:"t1",arm:"placebo",skillsLoaded:[],model:"m",harness:{name:"h",version:"v"},repeatIndex:0,tokens:{system:null,skillStanding:10,skillInvocation:20,perTurn:30},wallClockMs:40,objectiveEndpoint:{kind:"x",pass:true},judgeVerdict:null};const out=analyse([r],{t1:true});expect(out.groups.placebo.standing).toBe(10);expect(out.groups.placebo.invocation).toBe(20);expect(out.groups.placebo.wholeSession).toBe(30);expect(out.groups.placebo.wallClockMs).toBe(40);expect(out.correlation.n).toBe(1);});
 it("blocks unreceipted result claims and retired seed terminology",()=>{expect(()=>validateClaims("the result proves 99",0)).toThrow();expect(()=>validateClaims("seed=1",1)).toThrow();});
});
