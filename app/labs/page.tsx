import Link from "next/link";
import LabThumb from "@/components/labs/LabThumb";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata = {
  title: "Labs & Games",
  description:
    "Gaia Research labs — little browser toys for poking at agent capability. Everything runs locally; benchmark claims are published separately after review.",
};

const labs = [
  {
    kind: "craft" as const,
    title: "Infinite Skill Craft",
    tag: "Live · Game",
    description:
      "Smash two dev skills together and see what the forge coughs up. Then do it again. And again. Infinite, obviously.",
    cta: "Start crafting",
    href: "/labs/infinite-skill-craft",
  },
  {
    kind: "diet" as const,
    title: "Context Diet",
    tag: "Beta · Tool",
    description:
      "Feed it a bloated context file and watch it shrink to a lean, mean skill sliver. Weigh-in stays in your browser.",
    cta: "Trim a prompt",
    href: "/labs/context-diet",
  },
  {
    kind: "supabase" as const,
    title: "Supabase Hub",
    tag: "Dev · Dashboard",
    description:
      "Developer sampler & diagnostic console for Supabase schemas, triggers, RLS policies, and live telemetry health.",
    cta: "Inspect schemas",
    href: "/labs/supabase",
  },
] as const;

export default function LabsIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="lab-index" aria-labelledby="labs-title">
        <p className="signal"><span /> PULL A LEVER, SEE WHAT SPARKS</p>
        <h1 id="labs-title" style={{ fontSize: "var(--type-display-2)" }}>Labs &amp; Games.</h1>
        <p style={{ color: "var(--muted)", maxWidth: "56ch" }}>
          Little browser toys we build to poke at agent capability. No login, no download, nothing
          leaves your machine &mdash; comparative benchmark claims land on the research ledger only
          after review.
        </p>
        <div className="labs-play-grid" style={{ marginTop: "var(--space-tight)" }}>
          {labs.map((lab) => (
            <Link className={`play-card play-card-${lab.kind}`} href={lab.href} key={lab.href}>
              <LabThumb kind={lab.kind} />
              <div className="play-card-body">
                <span className="play-tag">{lab.tag}</span>
                <h3>{lab.title}</h3>
                <p>{lab.description}</p>
                <span className="play-go">{lab.cta} <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
