# Gaia Research agent contract

Cache with `CLAUDE.md`.

## Multi-phase epic orchestration

Every multi-phase epic uses one durable integration branch named
`dev/<epic>-integration`. Phase work is reviewed through exactly one phase pull
request per repository touched; worker lanes do not open separate pull requests.
When a phase is accepted, its pull request merges into the epic integration
branch, never directly into `main`. Accepted-phase follow-up fixes land on that
same integration branch. Only the final, fully accepted integration branch is
proposed for merge to `main`.

Do not create replacement phase pull requests to address review feedback. Keep
the canonical phase pull request and branch current until acceptance. Close
superseded donor or lane pull requests after preserving reusable commit
references in the plan or decision log. Never describe the canonical active
phase pull request as stale.

The orchestrator must reread the ratified epic plan and its durable founder
memory before dispatching or reviewing work. Founder decisions must be ratified
in the plan, durable memory, and active tracking issue before lanes continue.
The orchestrator owns the phase-to-integration mapping and must prevent workers
from silently changing accepted scope.

## Milim-specific authority

For the Milim epic, read `docs/plans/milim-player-pipeline-plan.md` and the
private pipeline's `founder/MEMORY.md` before acting. The private pipeline owns
editable source and release assembly; this repository consumes only promoted,
immutable releases.
