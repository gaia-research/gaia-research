import Link from "next/link";
import "./field-manual.css";

// Homepage feature: the Orchestration Guide and the Agent Playbook presented as
// two facing pages of one field manual. Left page = understand (read in the
// browser). Right page = preserve (a public repo you read as context, with
// skills that are optional and installed only after consent).

const ladder = [
  ["A", "One agent", "default"],
  ["B", "Bounded subagents", ""],
  ["C", "Existing workflows", ""],
  ["D", "Thin scheduler", "optional"],
  ["E", "Human at the wheel", ""],
] as const;

const files = [
  ["MEMORY.md", "start here · conversational entry"],
  ["PLAYBOOK.md", "the canonical policy"],
  ["skills/", "orchestrate · prompting — optional"],
  ["profiles/", "marco (example) · template (yours)"],
] as const;

export default function FieldManual() {
  return (
    <section id="field-manual" className="fm" aria-labelledby="fm-title">
      <div className="fm-shell">
        <header className="fm-head">
          <p className="fm-kicker"><span aria-hidden="true" /> Field manual · two public resources</p>
          <h2 id="fm-title">Learn the method. <em>Keep</em> your rules.</h2>
          <p className="fm-lede">
            Coordinating agents economically is something you can study. Getting a fresh agent to work the way <i>you</i> want, without
            re-explaining it every session, is a different problem. These two resources take one each.
          </p>
        </header>

        <div className="fm-spread">
          <article className="fm-page fm-guide" aria-labelledby="fm-guide-title">
            <p className="fm-folio"><b>01</b> Understand <span>Research guide</span></p>
            <h3 id="fm-guide-title">The Orchestration Guide</h3>
            <p className="fm-question">&ldquo;What is the least expensive coordination architecture that reliably completes the work?&rdquo;</p>
            <p className="fm-body">
              When one agent is enough, when a few bounded subagents earn their overhead, and when a human should keep the wheel.
              Experience-based, with its evidence gaps stated.
            </p>
            <ol className="fm-ladder" aria-label="The guide's A to E coordination ladder">
              {ladder.map(([level, name, note]) => (
                <li key={level}><b>{level}</b><span>{name}</span>{note && <small>{note}</small>}</li>
              ))}
            </ol>
            <div className="fm-actions">
              <Link className="fm-cta" href="/research/orchestration-guide">Read the guide <span aria-hidden="true">→</span></Link>
              <span className="fm-mode"><i aria-hidden="true">◇</i> Read in the browser · nothing to install</span>
            </div>
          </article>

          <article className="fm-page fm-playbook" aria-labelledby="fm-playbook-title">
            <p className="fm-folio"><b>02</b> Preserve <span>Public repo · MIT</span></p>
            <h3 id="fm-playbook-title">The Agent Playbook</h3>
            <p className="fm-question">&ldquo;Your agent shouldn&rsquo;t have to rediscover how you want it to work.&rdquo;</p>
            <p className="fm-body">
              A few plain documents (an operating philosophy, two optional skills and a swappable personal profile) that carry your
              conventions across conversations, models and harnesses.
            </p>
            <ul className="fm-files" aria-label="What is in the repository">
              {files.map(([name, note]) => (
                <li key={name}><code>{name}</code><span>{note}</span></li>
              ))}
            </ul>
            <ul className="fm-paths" aria-label="Two separate ways to adopt it">
              <li><Link className="fm-path fm-path-read" href="/research/agent-playbook#memory">
                <span className="fm-path-tag">Read as memory</span>
                <span className="fm-path-copy">Point a chat assistant at it. It proposes what to remember; you approve each entry.</span>
                <span className="fm-path-note">No install</span>
              </Link></li>
              <li><Link className="fm-path fm-path-install" href="/research/agent-playbook#skills">
                <span className="fm-path-tag">Install optional skills</span>
                <span className="fm-path-copy">Your coding agent inspects the repo, shows a copy plan, then waits for your yes.</span>
                <span className="fm-path-note">Needs your consent</span>
              </Link></li>
            </ul>
            <div className="fm-actions">
              <Link className="fm-cta" href="/research/agent-playbook">Explore the Agent Playbook <span aria-hidden="true">→</span></Link>
              <a className="fm-link" href="https://github.com/gaia-research/agent-playbook" target="_blank" rel="noreferrer">
                GitHub <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </article>
        </div>

        <p className="fm-seam"><span>The guide teaches the decision.</span> <span>The playbook remembers yours.</span></p>
      </div>
    </section>
  );
}
