# Source & Evidence Ledger: If Everything Can Be Recreated, Who Gets Remembered?

## Primary Source 1: Reverse Engineer Anything (REA)
- **Title:** Reverse Engineer Anything (REA) — One MCP for reverse engineering across binaries, applications, and runtime behavior
- **Author:** morluto
- **Repository:** https://github.com/morluto/rea
- **Distribution:** `rea-agents` on npm (MIT License)
- **Demonstrated Scope:** Bridges AI coding agents (Claude Code, Cursor, Codex, Windsurf, Claude Desktop) via MCP and CLI to disassembly and decompilation tools (Ghidra, Hopper, IDA Pro), AST analysis, JavaScript/Electron ASAR extraction, .NET CIL metadata parsing, Android APK manifests, and WebAssembly.
- **Mechanism:** Operates on the three-phase triad **Decompile, Understand, Recreate**. Rather than magically restoring proprietary source code verbatim, it extracts symbols, strings, call graphs, and pseudo-C/AST representations to explain subsystem behavior with concrete evidence, enabling an agent to synthesize a clean-room implementation in target frameworks.
- **Fabrication Risks:** Do not claim REA instantly recompiles commercial desktop suites into perfect open-source repositories or that it bypasses all anti-tamper/obfuscation. Accurately scope it as an agentic analysis assistant.

## Primary Source 2: Open Source Provenance vs. Popularity Signals
- **Mechanism:** Git DAG object model (`commit`, `tree`, `blob`, `tag`), cryptographically linked through content hashes (SHA-1/SHA-256), cryptographic commit signatures (PGP/SSH), committer/author fields, and timestamped parentage.
- **Contrast Metric:** GitHub stars measure attention, social virality, and marketing reach. They carry no cryptographic proof of original authorship, no guarantee of maintenance, and no verification of code correctness.

## Primary Source 3: Historical Case Studies
1. **The Electric Automobile (Invention vs. Engineering vs. Popularization):**
   - *Early Inventors:* Ányos Jedlik (1828, Hungary; small model electric carriage and motor); Thomas Davenport (1834/1835, Vermont; direct-current motor and track vehicle); Robert Anderson (Scotland, ~1832–1839; early crude electric carriage); William Morrison (Des Moines, Iowa, ~1890; first successful 6-passenger electric carriage in America). Ferdinand Porsche (1898 Egger-Lohner C.2 Phaeton / P1; 1900 Lohner-Porsche Semper Vivus hybrid). In 1900, electric cars comprised ~38% of US automobiles (steam 40%, gasoline 22%).
   - *Modern Commercialization & Scale:* AC Propulsion tzero (1997); Martin Eberhard and Marc Tarpenning founded Tesla Motors (2003); joined by Elon Musk and JB Straubel (2004). Modern scaling required solving lithium-ion thermal runaway, battery management architectures, inverter efficiency, and mass manufacturing.
   - *Nuance:* Confusing the popularizer with the inventor erases historical reality. Both made real, distinct contributions: the initial breakthrough of possibility, the engineering of reliability, and the cultural scaling of adoption.
2. **Photoshop and Cultural Identity (Software as Eponym vs. Functional Parity):**
   - *Origins:* Thomas and John Knoll created "Display" (1987), renamed "ImagePro" (1988); licensed to Adobe Systems in September 1988; released as Adobe Photoshop 1.0 in February 1990.
   - *Parity & Re-creation:* Ivan Kutskir independently developed Photopea (2013–present), recreating Photoshop's core raster editing, layer styles, and PSD parsing inside browser JavaScript. Melanie Perkins, Cliff Obrecht, and Cameron Adams founded Canva (2012), shifting document design to browser templates.
   - *Nuance:* Even when every pixel-blending algorithm is documented, open, or re-implemented in WebAssembly, "Photoshop" remains an indelible verb and cultural identity. Recreating the software does not recreate the decades of human workflow evolution behind it.

## Primary Source 4: Gaia Skill Tree & Yggdrasil Provenance Model
- **Reference:** `content/blog/yggdrasil-ii/post.md`, `founder/RATIFICATION.md` § 10, and `gaia-skill-tree` Yggdrasil II release report (`v7.0.0`, EPIC #1002).
- **Architecture:** Separates topological skill composition (`basic` vs `fusion`) from prestige and trust. Trust Magnitude (TM) evaluates concrete runtime evidence, verification passes, and operational lineage.
- **Attribution Policy:** Dual-axis recognition. Historical provenance (originator identity) is immutable and recorded; operational prestige (stars, rank, trust tier) is earned through continuous testing, reliable execution, and demonstrated maintenance. A trust badge does not rewrite who created the skill; it rewards who keeps it working.

## Counterargument & Legal Context
- **Legal Precedent for Clean-Room Engineering:** *Sega Enterprises Ltd. v. Accolade, Inc.*, 977 F.2d 1510 (9th Cir. 1992); *Sony Computer Entertainment, Inc. v. Connectix Corp.*, 203 F.3d 596 (9th Cir. 2000). Disassembly for interoperability and clean-room re-implementation is protected fair use under copyright law.
- **Economic Steel-Man:** Decompilation and open re-implementation democratize access, prevent predatory vendor lock-in, and rescue abandoned protocols. Attribution must never become a feudal deed or state-sanctioned monopoly protecting stagnant first movers.
