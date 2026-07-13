import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata = {
  title: "Research",
  description:
    "Gaia Research publications, postmortems, and open research plans for evidence-first agent work.",
};

const reports = [
  {
    href: "/research/ci-churn",
    type: "Postmortem",
    status: "VRF verified",
    title: "The Compounding Cost of CI Failures",
    description:
      "A traced account of Epic #780 and the feedback-loop tax autonomous agents pay when CI discovers what local validation missed.",
    action: "Read the postmortem",
  },
  {
    href: "/research/cost",
    type: "Research plan",
    status: "PRP proposed",
    title: "When Agents Report Their Own Cost",
    description:
      "A proposed study of the gap between an agent’s self-estimate, complete rate-card pricing, and the matching invoice.",
    action: "Read the plan",
  },
] as const;

export default function ResearchIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="research-index" aria-labelledby="research-title">
        <header className="research-index-head">
          <p className="signal"><span /> PUBLICATION INDEX</p>
          <h1 id="research-title">Research, with receipts.</h1>
          <p>
            Methods, postmortems, and live research questions from the Gaia laboratory. Every
            finding names its evidence; every unfinished study says so plainly.
          </p>
        </header>

        <section aria-labelledby="research-list-title">
          <h2 id="research-list-title" className="sr-only">Research publications</h2>
          <div className="research-list">
            {reports.map((report) => (
              <article className="research-entry" key={report.href}>
                <div className="research-entry-meta">
                  <span>{report.type}</span>
                  <span className={`research-status ${report.status.startsWith("VRF") ? "vrf" : "prp"}`}>{report.status}</span>
                </div>
                <h2>{report.title}</h2>
                <p>{report.description}</p>
                <Link href={report.href} className="research-entry-link">{report.action} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
