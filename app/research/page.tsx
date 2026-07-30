import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { researchEntries, statusText } from "@/data/research";

export const metadata = {
  title: "Research",
  description:
    "Gaia Research publications, postmortems, and open research plans for evidence-first agent work.",
};

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
            {researchEntries.map((report) => (
              <article className="research-entry" key={report.href}>
                <div className="research-entry-meta">
                  <span>{report.type}</span>
                  <span className={`research-status ${report.status.toLowerCase()}`}>
                    {report.status} {statusText[report.status]}
                  </span>
                </div>
                <h2>{report.title}</h2>
                <p>{report.description}</p>
                <Link href={report.href} className="research-entry-link">
                  {report.action} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

