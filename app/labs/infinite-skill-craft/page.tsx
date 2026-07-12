// Infinite Skill Craft — /labs/infinite-skill-craft (Lab 002)
// A drag-and-drop skill-fusion sandbox. Homage to Neal Agarwal's Infinite Craft
// (https://neal.fun/infinite-craft/) — an original implementation, NOT a fork.
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { CraftCanvas } from "@/components/labs/craft/CraftCanvas";
import "./craft.css";

export const metadata = {
  title: "Infinite Skill Craft — Lab 002",
  description:
    "Drag one dev skill onto another and watch what falls out. A fusion sandbox where /api-call meets /chain-of-thought — canonical unlocks link straight into the Gaia Skill Tree, experiments stay playable, and the occasional curse keeps things honest, boss.",
};

export default function InfiniteSkillCraftPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="lab-page craft-page">
        {/* SLOT: onboarding/about/faq/dragon mounted by wave 3b */}

        <section className="lab-hero craft-hero">
          <div>
            <p className="signal">
              <span /> LAB 002 / INFINITE SKILL CRAFT
            </p>
            <h1>
              Fuse two skills.<br />
              See what <em>hatches.</em>
            </h1>
            <p>
              Drag one skill card onto another and the forge runs the fusion.
              Canonical results unlock a real page in the Gaia Skill Tree —
              everything else is a fresh experiment for you to judge, boss.
            </p>
            <p className="craft-homage">
              A homage to{" "}
              <a
                href="https://neal.fun/infinite-craft/"
                target="_blank"
                rel="noreferrer noopener"
              >
                Infinite Craft
              </a>{" "}
              by Neal Agarwal — rebuilt from scratch for the skill tree.
            </p>
          </div>
        </section>

        <CraftCanvas />
      </main>
      <SiteFooter />
    </>
  );
}
