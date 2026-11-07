// rehype plugin: give every <td> a data-label copied from its column header,
// and mark the table so CSS can stack it into cards on narrow screens.
// Desktop keeps the real <table>; the phone layout reads the same cells, so no
// data is duplicated or dropped.

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function findAll(node: HastNode, tag: string, out: HastNode[] = []): HastNode[] {
  if (node.type === "element" && node.tagName === tag) out.push(node);
  for (const child of node.children ?? []) findAll(child, tag, out);
  return out;
}

export function labelTable(table: HastNode) {
  const headRow = findAll(table, "thead")[0];
  const headers = headRow ? findAll(headRow, "th").map((th) => textOf(th).replace(/\s+/g, " ").trim()) : [];
  if (headers.length === 0) return;
  table.properties = { ...(table.properties ?? {}), "data-stack": "true", "data-cols": String(headers.length) };
  for (const body of findAll(table, "tbody")) {
    for (const row of findAll(body, "tr")) {
      const cells = (row.children ?? []).filter((c) => c.type === "element" && (c.tagName === "td" || c.tagName === "th"));
      cells.forEach((cell, i) => {
        if (headers[i]) cell.properties = { ...(cell.properties ?? {}), "data-label": headers[i] };
      });
    }
  }
}

export default function rehypeTableLabels() {
  return (tree: HastNode) => {
    for (const table of findAll(tree, "table")) labelTable(table);
  };
}
