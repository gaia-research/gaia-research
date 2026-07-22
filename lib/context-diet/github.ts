export const MAX_GITHUB_RESPONSE_BYTES = 1_000_000;
export const MAX_CONTEXT_FILE_BYTES = 200_000;
export const MAX_DISCOVERED_FILES = 25;

const PART = /^[A-Za-z0-9_.-]+$/;

export type GitHubTarget = {
  owner: string;
  repo: string;
  ref?: string;
  path?: string;
};

export function isAgentContextPath(path: string): boolean {
  const normalized = path.replace(/^\/+/, "");
  const base = normalized.split("/").pop() ?? "";
  if (["CLAUDE.md", "AGENTS.md", "GEMINI.md", ".cursorrules", ".windsurfrules", ".clinerules"].includes(base)) return true;
  if (normalized === ".github/copilot-instructions.md") return true;
  return /^(?:\.cursor\/rules\/.*\.mdc|\.roo\/rules\/.*\.md)$/.test(normalized);
}

export function parsePublicGitHubUrl(input: string): GitHubTarget {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Enter a complete public GitHub URL.");
  }
  if (url.protocol !== "https:" || url.hostname !== "github.com" || url.username || url.password || url.port) {
    throw new Error("Only public https://github.com URLs are supported.");
  }
  const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (parts.length < 2 || !PART.test(parts[0]) || !PART.test(parts[1])) {
    throw new Error("Use a GitHub repository or file URL.");
  }
  const repo = parts[1].replace(/\.git$/, "");
  if (!repo || !PART.test(repo)) throw new Error("Invalid GitHub repository name.");
  const target: GitHubTarget = { owner: parts[0], repo };
  if (parts.length === 2) return target;
  if (parts[2] !== "blob" || parts.length < 5 || !PART.test(parts[3])) {
    throw new Error("Use a repository URL or a GitHub /blob/ file link.");
  }
  const path = parts.slice(4).join("/");
  if (!isAgentContextPath(path)) throw new Error("That link is not a recognized agent-context file.");
  return { ...target, ref: parts[3], path };
}

export async function readBoundedResponse(response: Response, maxBytes: number): Promise<string> {
  if (!response.ok) throw new Error(response.status === 404 ? "GitHub repository or file not found." : "GitHub request failed.");
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new Error("GitHub response is too large.");
  if (!response.body) {
    const text = await response.text();
    if (new TextEncoder().encode(text).length > maxBytes) throw new Error("GitHub response is too large.");
    return text;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error("GitHub response is too large.");
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(merged);
}
