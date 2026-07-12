import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata = {
  title: "Labs",
  description:
    "Gaia Research live labs — experimental local surfaces for exploring agent capability. Benchmark results are published separately.",
};

const labs = [
  {
    title: "Context Diet",
    status: "Lab 001 · WIP",
    description:
      "Measure an agent context file, project a reduction band, and export a SKILL.md proposal — entirely in your browser.",
    href: "/labs/context-diet",
  },
  {
    title: "Infinite Skill Craft",
    status: "Lab 002 · Live",
    description:
      "Drag two dev skills together and discover what the forge spits out, boss.",
    href: "/labs/infinite-skill-craft",
  },
] as const;

export default function LabsIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="lab-index" aria-labelledby="labs-title">
        <p className="signal"><span /> LIVE RESEARCH SURFACES</p>
        <h1 id="labs-title" style={{ fontSize: "var(--type-display-2)" }}>Labs.</h1>
        <p style={{ color: "var(--muted)", maxWidth: "56ch" }}>
          Experimental, evidence-first surfaces. Each lab runs locally in your browser; comparative
          benchmark claims are published to the research ledger only after review.
        </p>
        <div className="lab-index-grid">
          {labs.map((lab) => (
            <Link className="lab-card" href={lab.href} key={lab.href}>
              <span>{lab.status}</span>
              <h3>{lab.title}</h3>
              <p>{lab.description}</p>
              <span>Open lab →</span>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
