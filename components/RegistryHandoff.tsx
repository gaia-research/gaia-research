const signalPaths = [
  "M0 276 C58 276 74 306 142 306 H238",
  "M0 306 C64 306 88 320 142 320 H238",
  "M0 336 C58 336 74 332 142 332 H238",
];

const treePaths = [
  "M330 320 H394 V120 H470",
  "M394 198 H526 V86 H612",
  "M394 236 H502 V212 H586",
  "M394 282 H506 V310 H624",
  "M394 350 H492 V422 H588",
  "M394 386 H526 V518 H646",
  "M470 120 V54 H554",
  "M502 212 V160 H544",
  "M506 310 V268 H564",
  "M492 422 V474 H552",
  "M526 518 V568 H600",
];

const nodes = [
  [470, 120], [612, 86], [554, 54], [586, 212], [544, 160], [624, 310],
  [564, 268], [588, 422], [552, 474], [646, 518], [600, 568],
] as const;

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
            <desc id="registry-tree-description">Blue and pink research signals cross a diamond seal and become an amber tree of evidence routes.</desc>
            <g className="tree-signals" aria-hidden="true">
              {signalPaths.map((path, index) => <path className={`tree-signal tree-signal-${index + 1}`} d={path} key={path} />)}
            </g>
            <g className="tree-seal" aria-hidden="true">
              <rect x="248" y="258" width="88" height="88" transform="rotate(45 292 302)" />
              <rect x="261" y="271" width="62" height="62" transform="rotate(45 292 302)" />
              <path d="M292 278 L298 296 L316 302 L298 308 L292 326 L286 308 L268 302 L286 296 Z" />
            </g>
            <g className="tree-branches" aria-hidden="true">
              {treePaths.map((path) => <path d={path} key={path} />)}
            </g>
            <g className="tree-nodes" aria-hidden="true">
              {nodes.map(([cx, cy], index) => <circle cx={cx} cy={cy} r={index % 3 === 0 ? 9 : 6} key={`${cx}-${cy}`} />)}
            </g>
          </svg>
          <figcaption id="registry-tree-caption">A research signal crosses the seal, then branches into a verifiable skill record.</figcaption>
        </figure>
      </div>
    </section>
  );
}
