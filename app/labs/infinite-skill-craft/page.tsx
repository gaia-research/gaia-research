// Infinite Skill Craft — /labs/infinite-skill-craft (Lab 002)
// A drag-and-drop skill-fusion sandbox. Homage to Neal Agarwal's Infinite Craft
// (https://neal.fun/infinite-craft/) — an original implementation, NOT a fork.
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { CraftCanvas } from "@/components/labs/craft/CraftCanvas";
import { CraftChromeBar } from "@/components/labs/craft/CraftChromeBar";
import { CraftFaq } from "@/components/labs/craft/CraftFaq";
import "./craft.css";
import "./craft-chrome.css";

export const metadata = {
  title: "Infinite Skill Craft — Lab 002",
  description:
    "Drop dev skills on a free-floating canvas, drag two together, and watch what falls out. A fusion sandbox where /prompt meets /code — canonical unlocks link straight into the Gaia Skill Tree, experiments stay playable, and the occasional curse keeps things honest, boss.",
};

export default function InfiniteSkillCraftPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="lab-page craft-page">
        {/* Wave 3b: chrome layer — onboarding, about, FAQ, traffic.
            CraftChromeBar (client) owns the OnboardingModal (auto-open on
            first visit + re-openable), AboutModal, and TrafficCounter.
            CraftFaq is below the canvas. Milim companion comes from
            the root layout (auto-detects craft context). */}

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
              Drop skills onto a free-floating canvas, drag two together, and the forge
              runs the fusion. Canonical results unlock a real page in the Gaia Skill Tree —
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

        {/* Chrome bar: traffic counter + "What's a skill" + About buttons + modals */}
        <CraftChromeBar />

        <CraftCanvas />

        {/* FAQ education layer: skill vocabulary, canonical vs experimental */}
        <CraftFaq />
      </main>
      <SiteFooter />
    </>
  );
}
