/**
 * app/labs/supabase/page.tsx
 *
 * Developer Hub for Supabase Integrations (One-Pager).
 * Showcases database schemas, live telemetry metrics, and planned feature state
 * adhering to the Cyber-Slime Laboratory visual design language (DESIGN.md).
 */

import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SupabaseConsole } from "@/components/labs/supabase/SupabaseConsole";

export const metadata = {
  title: "Supabase Integration Hub · Gaia Labs",
  description:
    "Internal developer dashboard and schema inspector for Gaia Research Supabase telemetry, analytics, and benchmark ledger integrations.",
};

export default function SupabaseLabPage() {
  return (
    <>
      <SiteHeader />
      <div className="wip-banner">
        <div>
          <span className="wip-tag">[INTERNAL DEV TOOL]</span>
          <p>
            Developer dashboard &amp; diagnostic sampler for Supabase schemas, triggers, and live telemetry.
          </p>
        </div>
      </div>

      <main id="main" className="lab-page" style={{ paddingBottom: "var(--space-expansive)" }}>
        <section className="section-shell" style={{ padding: "var(--space-dense) var(--gutter)" }}>
          <SupabaseConsole />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
