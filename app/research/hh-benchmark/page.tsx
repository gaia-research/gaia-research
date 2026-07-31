import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
// loaded as raw text by webpack asset/source
import methodologyMd from "@/content/reports/hh-benchmark/methodology.md";

export const metadata = {
  title: "The Hell Heaven Benchmark — Methodology",
  description:
    "How Gaia Research benchmarks agent skills: marginal efficacy against established model baselines, a heaven/hell trial split, and stamps earned by the trial. Arc I verified.",
};

// Render while the Markdown source is present at build time; Cloudflare Workers
// cannot read the deployed filesystem during a request.
export const dynamic = "force-static";
export const revalidate = false;

function loadMethodology() {
  return methodologyMd
    .split("\n")
    .filter((line: string) => !line.startsWith("# ") && !line.trim().startsWith("<!--"))
    .join("\n")
    .trim();
}

export default function HhBenchmarkPage() {
  const body = loadMethodology();
  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · METHOD · ARC I VERIFIED</p>
          <h1>The Hell Heaven<br />Benchmark</h1>
          <p className="report-sub">
            How do you benchmark a <em>skill</em>? A drug-trial method, drafted in public &mdash;
            receipts before results.
          </p>
          <dl className="report-meta">
            <div><dt>Origin</dt><dd>Gaia Research · Open method</dd></div>
            <div><dt>Scope</dt><dd>v1 marginal efficacy</dd></div>
            <div><dt>Status</dt><dd><span className="chip vrf">VRF · ARC I VERIFIED</span></dd></div>
          </dl>
          <div className="report-links">
            <Link href="/research/hh-benchmark/claims">Claim index &rarr;</Link>
            <a href="/reports/hh-benchmark/kc9-demo-replay.html">Interactive replay ↗</a>
            <a href="https://github.com/gaia-research/gaia-research/blob/main/docs/skill-heaven/VISION.md" target="_blank" rel="noreferrer">Vision ↗</a>
            <a href="https://github.com/gaia-research/gaia-research/blob/main/docs/skill-heaven/MISSION.md" target="_blank" rel="noreferrer">Mission ↗</a>
            <a href="https://github.com/gaia-research/gaia-research/issues/62" target="_blank" rel="noreferrer">Help wanted ↗</a>
          </div>
        </header>

        {/* The demo is the fastest way into the method, so it sits above it.
            Narrated, so it must not autoplay and must not start muted-by-default
            beyond the browser's own policy — the viewer presses play. Every
            spoken line is also burned in as a caption, so the audio carries no
            information the screen does not. */}
        <figure className="report-video">
          <video
            controls
            playsInline
            preload="none"
            poster="/reports/hh-benchmark/kc9-demo-poster.jpg"
            src="/reports/hh-benchmark/kc9-demo.mp4"
            aria-label="The KC9 three-minute demo: one task run under three loadouts — native, the doorless floor, and one curated skill — against a single shared endpoint. Narrated, with every spoken line also shown on screen."
          />
          <figcaption>
            <strong>The three-minute demo.</strong> One task, three loadouts, one endpoint &mdash;
            played back from the run that produced it. Every figure on screen is read out of{" "}
            <a
              href="https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/data/kc9-demo-transcript.jsonl"
              target="_blank"
              rel="noreferrer"
            >
              kc9-demo-transcript.jsonl
            </a>{" "}
            at render time, so the video cannot state a figure the records do not; ‡ marks the one
            pole that was measured but never committed. Narrated &mdash; and every spoken line is the
            same string shown on screen, so nothing is said that is not also read. Step through it
            yourself on the{" "}
            <a href="/reports/hh-benchmark/kc9-demo-replay.html">interactive replay ↗</a>, or read the{" "}
            <Link href="/research/hh-benchmark/claims">claim index &rarr;</Link>.
          </figcaption>
        </figure>

        <article className="report-body">
          <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
        </article>

        <footer className="report-foot">
          <p>Arc I baseline floor pricing and machine claim verification are complete. If you benchmark models or skills, come build Arc II with us.</p>
          {/* lexicon-allow: anchor slug of the line name, not N9's retired repo name */}
          <Link className="button secondary" href="/#skill-heaven-hell">Back to Skill Heaven/Hell <span>→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
