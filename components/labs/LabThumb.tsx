// Shared, pure-CSS lab thumbnails used on both the homepage #labs section and
// the /labs index. No images — every motif is divs, gradients, emoji, and
// keyframes. Animations idle-loop subtly and intensify on card hover; all of it
// stills under prefers-reduced-motion (see .labthumb rules in globals.css).

type LabThumbKind = "craft" | "diet" | "supabase";

export function LabThumb({ kind }: { kind: LabThumbKind }) {
  if (kind === "craft") {
    // Fusion motif: 🧠 + ⚙️ drift together, a spark fires between them, ∞ glows.
    return (
      <div className="labthumb labthumb-craft" aria-hidden="true">
        <span className="lt-grid" />
        <span className="lt-chip lt-chip-a">🧠</span>
        <span className="lt-spark" />
        <span className="lt-chip lt-chip-b">⚙️</span>
        <span className="lt-infinity">∞</span>
      </div>
    );
  }
  if (kind === "supabase") {
    // Supabase motif: ⚡ + 🗄️ live telemetry query pulse
    return (
      <div className="labthumb labthumb-craft" aria-hidden="true">
        <span className="lt-grid" />
        <span className="lt-chip lt-chip-a">🗄️</span>
        <span className="lt-spark" />
        <span className="lt-chip lt-chip-b">⚡</span>
      </div>
    );
  }
  // Diet motif: a stack of tall token bars compresses down to a lean sliver.
  return (
    <div className="labthumb labthumb-diet" aria-hidden="true">
      <span className="lt-grid" />
      <span className="lt-bars">
        <i style={{ ["--h" as string]: "82%" }} />
        <i style={{ ["--h" as string]: "96%" }} />
        <i style={{ ["--h" as string]: "70%" }} />
        <i style={{ ["--h" as string]: "88%" }} />
        <i style={{ ["--h" as string]: "62%" }} />
      </span>
      <span className="lt-arrow" />
      <span className="lt-sliver" />
    </div>
  );
}

export default LabThumb;
