import { readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  return value;
}
function equalJson(actual, expected) { return JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected)); }
export function evaluate(requestedPath) {
  const publicFixture = JSON.parse(readFileSync("fixture.json", "utf8"));
  const fixture = JSON.parse(readFileSync(`evaluators/expected/${publicFixture.slot}.json`, "utf8"));
  const requested = requestedPath ? resolve(requestedPath) : null;
  const failures = [];
  for (const item of fixture.outputs) {
    const path = resolve(item.file);
    if (requested && !(path === requested || path.startsWith(requested + "/") || requested.startsWith(dirname(path)))) continue;
    try {
      if (!statSync(path).isFile()) throw new Error("not a regular file");
      const body = readFileSync(path, "utf8");
      if (typeof item.content === "string") {
        if (body !== item.content) failures.push(`${item.file}: exact text mismatch`);
      } else {
        let parsed; try { parsed = JSON.parse(body); } catch { failures.push(`${item.file}: invalid JSON`); continue; }
        if (!equalJson(parsed, item.content)) failures.push(`${item.file}: JSON contract mismatch`);
      }
    } catch (error) { failures.push(`${item.file}: ${error.message}`); }
  }
  if (failures.length) { console.error(JSON.stringify({pass:false, failures})); process.exit(1); }
  console.log(JSON.stringify({pass:true, checked:fixture.outputs.map(x=>x.file)}));
}
