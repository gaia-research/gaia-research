// rehype plugin for the Orchestration Guide. Runs BEFORE rehype-katex.
//
// 1. A paragraph whose only content is one `$$…$$` expression is display math.
//    remark-math parses `$$…$$` written inline as inline math, and inline KaTeX
//    that wraps lets the fraction's absolutely positioned parts collide.
// 2. Marks the passages that get a visual treatment, so the page can render a
//    figure for them while keeping the original markdown available:
//      data-figure="cost-equation"  the C_verified equation
//      data-lever="…"               the four lever bullets under it
//      data-figure="ttl-compare"    the 5m vs 1h break-even table
//      data-figure="ttl-cases"      the Case 1 / Case 2 arithmetic list

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const isEl = (n: HastNode | undefined, tag?: string): n is HastNode =>
  !!n && n.type === "element" && (tag === undefined || n.tagName === tag);

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function classes(node: HastNode): string[] {
  const c = node.properties?.className;
  return Array.isArray(c) ? (c as string[]) : typeof c === "string" ? c.split(" ") : [];
}

const isInlineMath = (n: HastNode) => isEl(n, "code") && classes(n).includes("math-inline");

function firstMath(node: HastNode): HastNode | undefined {
  for (const child of node.children ?? []) {
    if (isInlineMath(child)) return child;
    if (isEl(child)) {
      const found = firstMath(child);
      if (found) return found;
    }
  }
  return undefined;
}

const LEVERS: [RegExp, string][] = [
  [/C_\{\\text\{execution\}\}/, "execution"],
  [/C_\{\\text\{orchestration\}\}/, "orchestration"],
  [/C_\{\\text\{verification\}\}/, "verification"],
];

function visit(node: HastNode) {
  for (const child of node.children ?? []) {
    if (!isEl(child)) continue;

    if (child.tagName === "p") {
      const meaningful = (child.children ?? []).filter((c) => !(c.type === "text" && !(c.value ?? "").trim()));
      if (meaningful.length === 1 && isInlineMath(meaningful[0])) {
        const math = meaningful[0];
        if (/C_\{\\text\{verified\}\}\s*=\s*\\frac/.test(textOf(math))) {
          child.tagName = "div";
          child.properties = { "data-figure": "cost-equation" };
          child.children = [];
          continue;
        }
        // Long "objective s.t. constraints" lines are re-set as aligned rows so
        // they fit a phone. Same maths, different line breaks.
        const src = textOf(math);
        if (/\\quad\s*\\text\{s\.t\.\}\s*\\quad/.test(src)) {
          const [objective, rest] = src.split(/\\quad\s*\\text\{s\.t\.\}\s*\\quad/);
          const constraints = rest.split(/,\s*\\quad/).map((c) => c.trim());
          const rows = [`& ${objective.trim()}`, `\\text{s.t.}\\; & ${constraints[0]}`, ...constraints.slice(1).map((c) => `& ${c}`)];
          math.children = [{ type: "text", value: `\\begin{aligned}${rows.join(" \\\\ ")}\\end{aligned}` }];
        }
        child.tagName = "div";
        child.properties = { ...(child.properties ?? {}), className: ["math-display-block"] };
        math.properties = {
          ...(math.properties ?? {}),
          className: classes(math).filter((c) => c !== "math-inline").concat("math-display"),
        };
        continue;
      }
    }

    if (child.tagName === "li") {
      const m = firstMath(child);
      const head = textOf(child).slice(0, 80);
      if (m) {
        const hit = LEVERS.find(([re]) => re.test(textOf(m)));
        if (hit) child.properties = { ...(child.properties ?? {}), "data-lever": hit[1] };
      } else if (/^Subscription Quota Economics/.test(head.trim())) {
        child.properties = { ...(child.properties ?? {}), "data-lever": "quota" };
      }
    }

    if (child.tagName === "table" && /Standard 5-Minute TTL/.test(textOf(child))) {
      child.properties = { ...(child.properties ?? {}), "data-figure": "ttl-compare" };
    }

    if (child.tagName === "ul") {
      const firstLi = (child.children ?? []).find((c) => isEl(c, "li"));
      if (firstLi && /^Case 1\b/.test(textOf(firstLi).trim())) {
        child.properties = { ...(child.properties ?? {}), "data-figure": "ttl-cases" };
      }
    }

    visit(child);
  }
}

export default function rehypeGuideFigures() {
  return (tree: HastNode) => visit(tree);
}
