import { ledgerRows } from "@/lib/data/research";
import { StatusChip } from "./StatusChip";

export function ResearchLedgerTable() {
  return (
    <section
      className="ledger section-shell"
      id="ledger"
      aria-labelledby="ledger-title"
    >
      <div className="section-kicker">01 / PUBLIC EVIDENCE</div>
      <div className="section-heading-row">
        <div>
          <h2 id="ledger-title">Research Ledger</h2>
          <p>
            Every capability claim gets a traceable state. Live registry
            synchronization is not connected yet.
          </p>
        </div>
        <a className="text-link" href="#protocol">
          Read the protocol →
        </a>
      </div>
      <div className="table-wrap">
        <table>
          <caption className="sr-only">
            Selected Gaia Research ledger records
          </caption>
          <thead>
            <tr>
              <th scope="col">Record</th>
              <th scope="col">Type</th>
              <th scope="col">State</th>
              <th scope="col">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {ledgerRows.map((row) => (
              <tr key={row.record}>
                <th scope="row">{row.record}</th>
                <td>{row.kind}</td>
                <td>
                  <StatusChip status={row.status} />
                </td>
                <td>
                  {row.href ? (
                    <a className="table-link" href={row.href}>
                      ↗ {row.source}
                    </a>
                  ) : (
                    <span className="pending">○ {row.source}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
