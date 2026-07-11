const signalPaths = [
  "M0 276 C58 276 74 306 142 306 H238",
  "M0 306 C64 306 88 320 142 320 H238",
  "M0 336 C58 336 74 332 142 332 H238",
];

// Circuit-trace tree, rooted at the seal's right vertex and fanning rightward.
// Balanced binary growth: trunk → two mains → four canopy leaves → terminals.
// `cls` drives the scroll-grown draw order (trunk first, terminals last).
const branches = [
  { d: "M336 302 H404", cls: "b-trunk" },
  { d: "M404 302 V196 H472", cls: "b-1" },
  { d: "M404 302 V408 H472", cls: "b-1" },
  { d: "M472 196 V104 H560", cls: "b-2" },
  { d: "M472 196 V244 H560", cls: "b-2" },
  { d: "M472 408 V360 H560", cls: "b-2" },
  { d: "M472 408 V500 H560", cls: "b-2" },
  { d: "M560 104 H636", cls: "b-3" },
  { d: "M560 244 V210 H628", cls: "b-3" },
  { d: "M560 360 V394 H628", cls: "b-3" },
  { d: "M560 500 H636", cls: "b-3" },
];

const nodes = [
  { cx: 404, cy: 302, r: 8, cls: "node-root" },
  { cx: 472, cy: 196, r: 7, cls: "node-mid" },
  { cx: 472, cy: 408, r: 7, cls: "node-mid" },
  { cx: 560, cy: 104, r: 6, cls: "node-leaf" },
  { cx: 560, cy: 244, r: 6, cls: "node-leaf" },
  { cx: 560, cy: 360, r: 6, cls: "node-leaf" },
  { cx: 560, cy: 500, r: 6, cls: "node-leaf" },
  { cx: 636, cy: 104, r: 5, cls: "node-term" },
  { cx: 628, cy: 210, r: 5, cls: "node-term" },
  { cx: 628, cy: 394, r: 5, cls: "node-term" },
  { cx: 636, cy: 500, r: 5, cls: "node-term" },
];

export default function RegistryHandoff() {
  return (
    <section id="skill-tree" className="registry-handoff" aria-labelledby="registry-title">
      <div className="registry-handoff-shell">
        <div className="registry-copy">
          <p className="signal"><span /> RESEARCH SIGNAL / PERMANENT RECORD</p>
          <h2 id="registry-title">Let the research <em>take root.</em></h2>
          <p className="registry-lede">Gaia Research tests the frontier in public. Gaia Skill Tree keeps the attributable, evidence-backed record of what agents can actually do.</p>
          <dl className="registry-terms">
            <div><dt>FROM</dt><dd>Open research, methods, and experiments.</dd></div>
            <div><dt>TO</dt><dd>A public registry of demonstrated agent skills.</dd></div>
          </dl>
          <a className="registry-cta" href="https://gaiaskilltree.com" target="_blank" rel="noreferrer">
            Enter Gaia Skill Tree <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        <figure className="registry-tree" aria-labelledby="registry-tree-caption">
          <svg viewBox="0 0 680 620" role="img" aria-labelledby="registry-tree-title registry-tree-description" preserveAspectRatio="xMidYMid meet">
            <title id="registry-tree-title">Research signals becoming a golden skill tree</title>
            <desc id="registry-tree-description">Blue and pink research signals cross a diamond seal and branch into an amber tree of verified skill records.</desc>
            <defs>
              <linearGradient id="treeStroke" gradientUnits="userSpaceOnUse" x1="336" y1="302" x2="648" y2="302">
                <stop offset="0" stopColor="#d97706" />
                <stop offset="0.55" stopColor="#f8d176" />
                <stop offset="1" stopColor="#fcd34d" />
              </linearGradient>
            </defs>
            <g className="tree-signals" aria-hidden="true">
              {signalPaths.map((path, index) => <path className={`tree-signal tree-signal-${index + 1}`} d={path} key={path} />)}
            </g>
            <g className="tree-seal" aria-hidden="true">
              <rect x="248" y="258" width="88" height="88" transform="rotate(45 292 302)" />
              <rect x="261" y="271" width="62" height="62" transform="rotate(45 292 302)" />
              <path className="seal-core" d="M292 278 L298 296 L316 302 L298 308 L292 326 L286 308 L268 302 L286 296 Z" />
            </g>
            <g className="tree-branches" aria-hidden="true">
              {branches.map(({ d, cls }) => <path className={cls} d={d} pathLength={1} key={d} />)}
            </g>
            <g className="tree-nodes" aria-hidden="true">
              {nodes.map(({ cx, cy, r, cls }) => <circle className={cls} cx={cx} cy={cy} r={r} key={`${cx}-${cy}`} />)}
            </g>
          </svg>
          <figcaption id="registry-tree-caption">A research signal crosses the seal, then branches into a verifiable skill record.</figcaption>
        </figure>
      </div>
    </section>
  );
}
