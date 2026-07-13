import Image from "next/image";

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
          <Image
            className="registry-tree-art"
            src="/assets/milim-take-root-final.webp"
            alt="Milim rests beneath the roots of a colossal luminous golden skill tree as petals fall through its branches."
            width={937}
            height={1679}
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 48vw, 52vw"
          />
          <figcaption id="registry-tree-caption">A quiet place beneath the Skill Tree, where open research becomes a permanent record.</figcaption>
        </figure>
      </div>
    </section>
  );
}
