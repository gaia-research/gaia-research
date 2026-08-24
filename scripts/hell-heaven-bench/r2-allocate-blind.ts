import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { allocateBlind, readAttempts } from "./r2-collection.ts";

const attemptFiles = process.argv.slice(2, -2);
const packetPath = resolve(process.argv.at(-2) ?? "");
const concealedPath = resolve(process.argv.at(-1) ?? "");
if (!attemptFiles.length || packetPath === concealedPath) throw new Error("usage: r2-allocate-blind.ts <attempt.jsonl...> <judge-packets.jsonl> <concealed-mapping.jsonl>");
const { packets, concealed } = allocateBlind(readAttempts(attemptFiles), "hh-r2-rubric/v1");
mkdirSync(dirname(packetPath), { recursive: true }); mkdirSync(dirname(concealedPath), { recursive: true });
writeFileSync(packetPath, packets.map(x => JSON.stringify(x)).join("\n") + "\n", { flag: "wx" });
writeFileSync(concealedPath, concealed.map(x => JSON.stringify(x)).join("\n") + "\n", { flag: "wx", mode: 0o600 });
console.log(JSON.stringify({ packets: packets.length, public: packetPath, concealed: concealedPath }, null, 2));
