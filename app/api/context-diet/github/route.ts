import { NextResponse } from "next/server";
import {
  isAgentContextPath,
  MAX_CONTEXT_FILE_BYTES,
  MAX_DISCOVERED_FILES,
  MAX_GITHUB_RESPONSE_BYTES,
  parsePublicGitHubUrl,
  readBoundedResponse,
} from "@/lib/context-diet/github";

const headers = { Accept: "application/vnd.github+json", "User-Agent": "gaia-research-context-diet" };
const pathEncode = (path: string) => path.split("/").map(encodeURIComponent).join("/");

async function githubJson(url: string, maxBytes = MAX_GITHUB_RESPONSE_BYTES) {
  const response = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(8_000) });
  return JSON.parse(await readBoundedResponse(response, maxBytes));
}

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("url") ?? "";
  let target;
  try {
    target = parsePublicGitHubUrl(input);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Invalid GitHub URL." }, { status: 400 });
  }

  try {
    const root = `https://api.github.com/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}`;
    if (target.path && target.ref) {
      const data = await githubJson(`${root}/contents/${pathEncode(target.path)}?ref=${encodeURIComponent(target.ref)}`, MAX_CONTEXT_FILE_BYTES * 2);
      if (data.type !== "file" || typeof data.content !== "string" || data.encoding !== "base64") throw new Error("GitHub did not return a readable file.");
      if (Number(data.size) > MAX_CONTEXT_FILE_BYTES) throw new Error("Context file is larger than 200 KB.");
      const binary = atob(data.content.replace(/\n/g, ""));
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const content = new TextDecoder().decode(bytes);
      if (bytes.byteLength > MAX_CONTEXT_FILE_BYTES) throw new Error("Context file is larger than 200 KB.");
      return NextResponse.json({ ok: true, file: { name: target.path, url: input, content } }, { headers: { "Cache-Control": "no-store" } });
    }

    const repository = await githubJson(root, 128_000);
    if (repository.private) throw new Error("Only public GitHub repositories are supported.");
    const ref = String(repository.default_branch || "main");
    const tree = await githubJson(`${root}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
    if (!Array.isArray(tree.tree)) throw new Error("GitHub did not return a repository tree.");
    const files = tree.tree
      .filter((entry: { type?: string; path?: string; size?: number }) => entry.type === "blob" && typeof entry.path === "string" && isAgentContextPath(entry.path) && Number(entry.size ?? 0) <= MAX_CONTEXT_FILE_BYTES)
      .slice(0, MAX_DISCOVERED_FILES)
      .map((entry: { path: string; size?: number }) => ({
        name: entry.path,
        size: Number(entry.size ?? 0),
        url: `https://github.com/${target.owner}/${target.repo}/blob/${ref}/${entry.path}`,
      }));
    return NextResponse.json({ ok: true, repository: `${target.owner}/${target.repo}`, ref, files, truncated: tree.truncated === true || files.length === MAX_DISCOVERED_FILES }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub scan failed.";
    const status = /not found/i.test(message) ? 404 : /too large|larger than/i.test(message) ? 413 : 502;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
