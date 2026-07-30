# Issue / Feature Plan: Blog Subscriber Email Pipeline & Mailing MCP Integration

- **Status:** Proposed Issue / RFC Plan
- **Owner:** Founder / Marcus Tiongson
- **Target Component:** Next.js Frontend (`app/blog`), Mailing Infrastructure, MCP Tooling, `.pi/skills/gaia-blog-post`
- **Dependencies:** Resend / Loops API key, MCP Server setup, Supabase / Cloudflare D1 subscriber table

---

## 1. Problem Statement & Motivation

Currently, when Nova authors and publishes a new field note or deep-dive blog post on `research.gaiaskilltree.com`, there is no mechanism for interested readers to subscribe or receive notifications. Readers must manually visit the site or check social media channels.

Furthermore, publishing a blog post is an agent-driven workflow managed by `.pi/skills/gaia-blog-post`. Adding a manual newsletter drafting step introduces human friction. 

We need an end-to-end subscriber pipeline that:
1. Provides a high-signal, dark-themed **Subscribe UI** across the Next.js site.
2. Manages subscriber lists securely via serverless endpoints.
3. Exposes a **Mailing MCP Server** to agents.
4. Extends the `gaia-blog-post` skill to automatically trigger subscriber email broadcasts upon publishing.

---

## 2. Technical Architecture & Component Breakdown

```
┌────────────────────────────────┐
│   User on Next.js Blog UI      │
│  (Footer / Post Subscribe Form)│
└──────────────┬─────────────────┘
               │ POST /api/subscribe
               ▼
┌────────────────────────────────┐
│  Cloudflare / Next.js API      │
│  & DB (Supabase / D1 Table)    │
└────────────────────────────────┘

┌────────────────────────────────┐       ┌─────────────────────────────────┐
│ `gaia-blog-post` Skill         │       │ Mailing MCP Server              │
│ (Publishing Pipeline)          │──────►│ (Resend / Loops API Tooling)    │
└────────────────────────────────┘       └──────────────┬──────────────────┘
                                                        │ Send Broadcast
                                                        ▼
                                         ┌─────────────────────────────────┐
                                         │ Email Subscribers Inbox         │
                                         └─────────────────────────────────┘
```

### Component A: Frontend Subscribe UI & API Route

- **Subscribe Component (`components/SubscribeForm.tsx`):**
  - Styled with Gaia Research aesthetic: `#ec4899` Milim Pink accents, dark obsidian canvas (`#09090b`), Syne/Bebas Neue headers.
  - Placed in:
    - Blog Index page (`app/blog/page.tsx`).
    - Individual blog post footers (`app/blog/[slug]/page.tsx`).
    - Optional sticky notification bar or modal.
  - Client-side validation, anti-spam honeypot, and Cloudflare Turnstile / hCaptcha support.
  - Feedback states: Loading spinner, Success ("Subscribed! Expect high-signal field notes from Nova."), Error state.

- **Subscriber API (`app/api/subscribe/route.ts`):**
  - Next.js Edge API Route handling `POST /api/subscribe`.
  - Stores subscriber records (`email`, `created_at`, `status: 'active'`, `unsubscribe_token`) in database.
  - Sends a confirmation / double opt-in welcome email.
  - Handles `POST /api/unsubscribe` via token verification.

### Component B: Mailing Service & MCP Tooling (`mailing-mcp`)

- **Service Selection:** Resend or Loops (developer-first email infrastructure with built-in broadcast management and high deliverability).
- **Mailing MCP Server (`scripts/mcp/mailing-mcp-server.ts` or npm package):**
  - Implements Model Context Protocol (MCP) tool schema for pi, Claude Code, and Hermes Agent.
  - **Exposed MCP Tools:**
    1. `preview_newsletter(title, slug, markdown_body, thumbnail_url)`: Renders responsive HTML email preview.
    2. `send_newsletter_broadcast(slug, title, summary, email_html, test_mode)`: Dispatches broadcast email to active subscribers.
    3. `get_subscriber_stats()`: Returns total active subscriber count and recent engagement metrics.

### Component C: `gaia-blog-post` Skill Extension

Extend `.pi/skills/gaia-blog-post/SKILL.md` with a mandatory post-publish broadcast phase:

```markdown
## 6. Post-Publishing Newsletter Broadcast Pipeline

After the blog post is deployed and passes the visual cut-off audit:

1. **Email Template Generation:** Convert the blog post Markdown into a responsive, email-friendly HTML format featuring:
   - Nova's intro note & voice.
   - Header with post title, date, and author.
   - Embedded WebP editorial thumbnail from `public/assets/`.
   - Direct link to full post on `https://research.gaiaskilltree.com/blog/<slug>`.
   - Unsubscribe link template.
2. **Preview & Verification:** Call Mailing MCP `preview_newsletter` to verify HTML rendering.
3. **Dispatch Broadcast:** Execute Mailing MCP `send_newsletter_broadcast` with `test_mode: false` (or request founder confirmation before sending live broadcasts).
```

---

## 3. Implementation Phases & Task Checklist

### Phase 1: Subscribe UI & Database Layer
- [ ] Create database migration for `subscribers` table (`id`, `email`, `status`, `subscribed_at`, `unsubscribe_token`).
- [ ] Implement `SubscribeForm.tsx` component with dark obsidian styling & responsive design.
- [ ] Implement `app/api/subscribe/route.ts` and `app/api/unsubscribe/route.ts`.
- [ ] Add Turnstile / honeypot anti-spam check.

### Phase 2: Mailing MCP Server Development
- [ ] Setup Resend / Loops API credentials in environment configuration (`RESEND_API_KEY`).
- [ ] Create `scripts/mcp/mailing-mcp-server.ts` implementing `preview_newsletter`, `send_newsletter_broadcast`, and `get_subscriber_stats`.
- [ ] Register MCP server in pi (`.pi/config.json`) and Hermes Agent config.

### Phase 3: `gaia-blog-post` Skill Integration & Verification
- [ ] Update `.pi/skills/gaia-blog-post/SKILL.md` and `./template.md` with Section 6 newsletter broadcast instructions.
- [ ] Test end-to-end flow: draft post → publish → generate email HTML → MCP dry-run broadcast → inspect email layout.
- [ ] Run `visual-audit` and `check-lexicon` to confirm zero UI cut-offs or contract breakages.

---

## 4. Open Questions & Approvals

- **Double Opt-In vs. Single Opt-In:** Should new subscribers require email confirmation before receiving post notifications? (Recommended: Double Opt-In to maintain low bounce rates).
- **Broadcast Approval Gate:** Should the agent send the newsletter broadcast completely autonomously, or issue a dry-run draft requiring a 1-click founder approval? (Recommended: Dry-run preview in agent log + automated send upon git push to `main`).
