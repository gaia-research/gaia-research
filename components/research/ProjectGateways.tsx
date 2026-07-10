import Link from "next/link";
import Image from "next/image";
import skillTree from "@/assets/generated/gateway-skill-tree-panel.webp";
import benchmarks from "@/assets/generated/gateway-benchmarks-panel.webp";
import ledger from "@/assets/generated/gateway-ledger-panel.webp";
import docs from "@/assets/generated/gateway-docs-panel.webp";

const gateways = [
  {
    name: "Gaia Skill Tree",
    text: "The canonical registry for named, durable capabilities.",
    href: "https://github.com/gaia-research/gaia-skill-tree",
    image: skillTree,
    style: "gateway-tree",
  },
  {
    name: "Benchmarks",
    text: "Evaluation suites built to make claims comparable.",
    href: "#benchmarks",
    image: benchmarks,
    style: "gateway-bench",
  },
  {
    name: "Ledger",
    text: "A public trail for protocols, data, and evidence.",
    href: "#ledger",
    image: ledger,
    style: "gateway-ledger",
  },
  {
    name: "Community",
    text: "Bring the test, the counterexample, or the next fusion.",
    href: "#community",
    style: "gateway-community",
  },
  {
    name: "Docs and specs",
    text: "Schemas, templates, and implementation notes—without gatekeeping.",
    href: "https://github.com/gaia-research/gaia-research/tree/main/docs",
    image: docs,
    style: "gateway-docs",
  },
  {
    name: "Context Diet Lab",
    text: "Measure a context file and project its diet — live, in your browser.",
    href: "/labs/context-diet",
    style: "gateway-labs",
  },
];

export function ProjectGateways() {
  return (
    <section
      className="gateways section-shell"
      id="research"
      aria-labelledby="gateways-title"
    >
      <div className="section-kicker">01 / PROJECT GATEWAYS</div>
      <div className="section-heading-row">
        <div>
          <h2 id="gateways-title">Choose your entry point.</h2>
          <p>Discovery in the lab. Permanent records in the tree.</p>
        </div>
      </div>
      <div className="gateway-grid">
        {gateways.map((gateway, index) => (
          <article className={`gateway ${gateway.style}`} key={gateway.name}>
            {gateway.image && (
              <Image
                src={gateway.image}
                alt=""
                className="gateway-art"
                sizes="(max-width: 700px) 100vw, 40vw"
              />
            )}
            {index === 3 && (
              <span className="community-orbit" aria-hidden="true">
                X · REDDIT · GITHUB
              </span>
            )}
            <div className="gateway-index">0{index + 1}</div>
            <div className="gateway-copy">
              <h3>{gateway.name}</h3>
              <p>{gateway.text}</p>
              <Link href={gateway.href}>
                Enter gateway <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
