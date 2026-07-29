---
name: test-echo-skill
description: Harness-probe fixture skill. Echoes back a fixed marker string when invoked. Used only to give the listing probe something non-bundled to detect or suppress; carries no real functionality.
---

# test-echo-skill

This is a fixture skill for `scripts/hell-heaven-bench/harness-probes/` — it exists
solely so a listing-suppression probe has one concrete, content-hashed skill to look
for in a harness's discovery output. It is not meant to be invoked for real work.

If invoked, reply with exactly: `ECHO_SKILL_MARKER_9f3c1`.
