/**
 * Standalone benchmark measuring Markdown + KaTeX parsing performance
 * for the Orchestration Guide (Issue #327 mitigation).
 * 
 * Usage: npx tsx scripts/bench-guide-render.ts
 */
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeGuideFigures from "../lib/rehype-guide-figures";
import rehypeTableLabels from "../lib/rehype-table-labels";
import { createMarkdownMemoizer } from "../lib/orchestration-guide-memoizer";

function compilePipeline(body: string): string {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath, { singleDollarTextMath: false })
    .use(remarkRehype)
    .use(rehypeGuideFigures)
    .use(rehypeKatex)
    .use(rehypeTableLabels);
  const hast = processor.runSync(processor.parse(body));
  return JSON.stringify(hast);
}

function runBenchmark() {
  const guidePath = path.resolve(__dirname, "../content/reports/orchestration-guide/guide.md");
  const rawGuide = fs.readFileSync(guidePath, "utf8");
  const body = rawGuide.split("\n").slice(2).join("\n").trim();
  const iterations = 5;

  console.log(`\n======================================================`);
  console.log(` Orchestration Guide Render Benchmark (Local Node.js) `);
  console.log(` Document Size: ${(Buffer.byteLength(body, "utf8") / 1024).toFixed(1)} KB | Iterations: ${iterations}`);
  console.log(` Node Version: ${process.version} | Platform: ${process.platform} ${process.arch}`);
  console.log(`======================================================\n`);

  // Case 1: Unmemoized (simulating per-request AST & KaTeX recompilation)
  console.log(`Running Case 1: Unmemoized (full parse on every iteration)...`);
  const unmemoizedOutputs: string[] = [];
  const startCpu1 = process.cpuUsage();
  const startWall1 = performance.now();
  const memBefore1 = process.memoryUsage().heapUsed;

  for (let i = 0; i < iterations; i++) {
    const out = compilePipeline(body);
    unmemoizedOutputs.push(out);
  }

  const endWall1 = performance.now();
  const endCpu1 = process.cpuUsage(startCpu1);
  const memAfter1 = process.memoryUsage().heapUsed;
  const wallMs1 = endWall1 - startWall1;
  const cpuMs1 = (endCpu1.user + endCpu1.system) / 1000;

  // Case 2: Memoized (simulating module-level cache lookup)
  console.log(`Running Case 2: Memoized (single parse, subsequent cache hits)...`);
  const memoizer = createMarkdownMemoizer(() => compilePipeline(body));
  const memoizedOutputs: string[] = [];
  const startCpu2 = process.cpuUsage();
  const startWall2 = performance.now();
  const memBefore2 = process.memoryUsage().heapUsed;

  for (let i = 0; i < iterations; i++) {
    const out = memoizer.get();
    memoizedOutputs.push(out);
  }

  const endWall2 = performance.now();
  const endCpu2 = process.cpuUsage(startCpu2);
  const memAfter2 = process.memoryUsage().heapUsed;
  const wallMs2 = endWall2 - startWall2;
  const cpuMs2 = (endCpu2.user + endCpu2.system) / 1000;

  // Parity Verification
  const parityMatch =
    unmemoizedOutputs[0] === memoizedOutputs[0] &&
    memoizedOutputs.every((o) => o === memoizedOutputs[0]);

  console.log(`\n--- Benchmark Results ---`);
  console.log(`Unmemoized Wall Time:  ${wallMs1.toFixed(1)} ms (${(wallMs1 / iterations).toFixed(1)} ms/call)`);
  console.log(`Unmemoized CPU Time:   ${cpuMs1.toFixed(1)} ms (${(cpuMs1 / iterations).toFixed(1)} ms/call)`);
  console.log(`Memoized Wall Time:    ${wallMs2.toFixed(1)} ms (${(wallMs2 / iterations).toFixed(1)} ms/call)`);
  console.log(`Memoized CPU Time:     ${cpuMs2.toFixed(1)} ms (${(cpuMs2 / iterations).toFixed(1)} ms/call)`);
  console.log(`Speedup (Wall Time):   ${(wallMs1 / wallMs2).toFixed(1)}x faster`);
  console.log(`Speedup (CPU Time):    ${(cpuMs1 / Math.max(cpuMs2, 0.1)).toFixed(1)}x faster`);
  console.log(`Output Parity Match:   ${parityMatch ? "PASS (100% byte identical)" : "FAIL"}`);
  console.log(`Compiled AST Length:   ${memoizedOutputs[0].length.toLocaleString()} characters\n`);
  console.log(`* Note: These are local Node.js measurements to verify algorithm behavior.`);
  console.log(`* Production Cloudflare Worker isolate metrics must be observed via Cloudflare traces.`);
}

runBenchmark();
