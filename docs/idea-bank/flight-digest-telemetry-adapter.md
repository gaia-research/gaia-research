# Flight Digest Telemetry Adapter

- **Rank:** 2
- **Viability:** Very High
- **Potential:** Very High

## What to research
- A plug-in telemetry adapter that converts arbitrary agent traces into a small, privacy-aware structural digest Skill Tree can ingest.
- Standard fields: tool name, step count, retries, latency bands, failure classes, recovery paths, token budget bands, task outcome, and capability hints.
- Push-based architecture so external agent systems stay invisible until they explicitly publish approved capability evidence.

## Why it matters
- Fits the repo rule that outside skills remain invisible unless they push.
- Gives users value even if they already have telemetry, because Gaia becomes a normalization and proof layer instead of a replacement stack.
- Cheapest path to broad ecosystem compatibility.
