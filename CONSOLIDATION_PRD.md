# PRD: Gaia Research x Gaia Skill Tree Consolidation

## 1. Executive Summary
**Objective:** Unify the energetic, open-science brand of "Gaia Research" with the prestigious, evidence-backed product of "Gaia Skill Tree" into a single, cohesive narrative and web presence before official launch.
**The Dilemma:** The current lab mascot (Milim) is chaotic and fun, while the Skill Tree (The Atlas) is a solemn, ceremonial ledger.
**The Solution:** Treat this dichotomy as a storytelling feature rather than a bug. Convert the Skill Tree repository into a lightweight, headless developer toolkit ("Gaia-Lite") and rebuild the UI in a modern React framework within the Gaia Research repository.

## 2. Brand & Narrative Architecture
We will maintain a dual-brand strategy linked by narrative.
*   **Gaia Research (The Lab):** The high-energy, chaotic-but-brilliant collective. Hosted by Milim (Chief Capability Scout). This acts as the DevRel face, appealing to builders who want to break things and push boundaries.
*   **Gaia Skill Tree (The Atlas):** The permanent, ceremonial artifact produced by the lab. It is the solemn ledger where the lab's discoveries are permanently recorded. 
*   **The Bridge:** Milim and the explorers "scout" the wild frontier of AI capabilities, and when a capability is verified, it is formally written into The Atlas.

## 3. Technical Architecture (The Decoupling)
Currently, `gaia-skill-tree` is a monolith containing developer tools *and* static HTML generation scripts. We will decouple these into two distinct surfaces:

### A. The Web Surface (`gaia-research` repo)
*   **Stack:** Modern React framework (Next.js/Remix).
*   **Purpose:** The single deployed website (e.g., `gaia.tiongson.co` or future domain).
*   **Structure:** 
    *   `/` (Home): The Milim-hosted Research Lab. High energy, blogs, open-science manifestos.
    *   `/atlas` (The Registry): The Skill Tree UI. The design strictly shifts to the dark, serious, Honor Red/Apex Gold ledger.
*   **Data Fetching:** Ingests `registry.json` directly from the core package to render the DAG and leaderboards dynamically, eliminating the need for Python HTML generators.

### B. The Core Developer Package (`gaia-skill-tree` repo)
*   **Stack:** Python / Node.
*   **Purpose:** A lightweight, headless toolkit ("Gaia-Lite"). 
*   **Contents:** 
    *   `registry.json` (The ground-truth database).
    *   `gaia_cli` (For interacting with the registry).
    *   `mcp` (The Model Context Protocol server).
    *   Python/Node SDKs.
*   **To be Deprecated:** All `build_docs.py`, `generateProfilePages.py`, and custom static HTML scripts will be deleted.

## 4. Phased Execution Plan (Post-Current Sprints)

**Phase 1: Freeze & Prepare**
*   Continue current sprints without disrupting the existing Python-based `gaia-skill-tree` deployment. 
*   Finalize the React component library in `gaia-research` for the Milim brand.

**Phase 2: The "Gaia-Lite" Extraction**
*   Create a branch in `gaia-skill-tree` to safely delete the HTML generation scripts.
*   Ensure the CLI, MCP, and SDKs run flawlessly in isolation, relying purely on `registry.json`.

**Phase 3: React Atlas Rebuild**
*   Scaffold the React application in `gaia-research`.
*   Build the `registry.json` parser in TypeScript.
*   Recreate the Skill Tree visual elements (badges, trees, leaderboards) as React components.

**Phase 4: Launch & Route Consolidation**
*   Deploy the unified React app.
*   Point `gaia.tiongson.co` (or the new dev domain) to the unified `gaia-research` deployment.
*   Publish the stripped-down `gaia-skill-tree` core to package managers (PyPI/npm).