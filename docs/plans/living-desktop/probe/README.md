# lt-probe — throwaway static probe (planning run, 2026-10-09)

**Not a product. Never install it anywhere that matters; never list it in a marketplace.** It exists to
answer one load-bearing question before design starts: does Claude Code's engine accept an
interactive vector graph, native controls over it, and a pointer surface inside a desktop `Pane`?

Run it (no login, no session, no inference — the engine's own validator and test kit):

```bash
~/.local/bin/claude plugin validate docs/plans/living-desktop/probe/lt-probe
~/.local/bin/claude plugin test     docs/plans/living-desktop/probe/lt-probe
```

Result on Claude Code **2.1.294**, macOS, 2026-10-09: **7 pass, 0 fail.**

| Test | Outcome |
|---|---|
| interactive `Svg` of 10,000 / 110,000 / 131,072 characters in a desktop `Pane` | accepted |
| `Svg` of 131,073 characters | refused — `ui.render (Pane) refused: Svg source longer than 131072 characters; the engine drew its own` |
| absolutely positioned `Box` holding a Button over the `Svg` | pressable (`{"element":"node-0"}`) |
| `Client` surface module on desktop | received a pointer `down` at cell x=3, y=0 and redrew |
| same Pane on the terminal surface | `Svg` draws nothing; the Buttons remain |

**What this does not show:** paint. The test kit exercises a mod's hooks, trees and surface modules under
each surface's rules; it never draws the desktop page. Desktop paint is probe cell H2 in
[`../B-ACCEPTANCE.md`](../B-ACCEPTANCE.md) §6 and needs the owner's desktop session. Recorded in
`docs/labs/harness-capability-matrix.md` gate (f).
