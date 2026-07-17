# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Review Rocket Demo — a static, FTC-compliant customer feedback/review-collection
funnel with lead capture, deployed on Vercel. See `replit.md` for full
architecture notes. Quick orientation:

- `demo/index.html`, `demo/lead-form.html` — the two static pages
- `demo/src/main.js` — star rating + form logic
- `demo/src/config.js` — single source of truth for branding/copy/URLs (edit
  this, not the HTML, when white-labeling for a new business)
- `demo/src/ui.css` — all styling, theme-driven via CSS custom properties
- `api/send-lead.js`, `api/send-feedback.js` — Vercel serverless functions
  (nodemailer + Gmail SMTP)
- No build step. No test suite currently exists (`package.json` test script
  is a stub).

FTC compliance is load-bearing: the public review link must stay reachable
from every rating path (1–5 stars). Don't reintroduce "review gating" (e.g.
hiding the public review link behind a rating threshold) when touching
`main.js` or the panel logic.

## Working rules

1. **Think before coding.** State the plan and any assumptions before editing;
   if a request is ambiguous, ask rather than guess.
2. **Keep it simple.** No abstractions, config flags, or generality beyond
   what the task needs — this is a small static app, not a framework.
3. **Surgical changes.** Touch only the files the task requires. Don't
   drive-by refactor unrelated code.
4. **Define done first.** Before editing, know what "working" looks like for
   this change, and check it afterward (load the page, click through the
   flow, or run the relevant serverless function locally per
   `demo/LOCAL_TESTING.md`).

## Available skills in this environment

Several capabilities that third-party "skill packs" advertise are already
built into this Claude Code setup — reach for these instead of installing
external skills:

- `/code-review` — reviews the current diff for correctness/reuse issues
- `/security-review` — reviews pending changes for security issues
- `/simplify` — cleanup pass for reuse/simplification/efficiency
- `/verify` — exercises a change end-to-end before calling it done
- `/run` — launches/screenshots the app for manual verification
- `/init` — regenerates this file from the codebase if it drifts

## External skills / MCP servers

Before adding any third-party skill or plugin marketplace, verify the repo
is real and reputable (star count and install count alone are not proof —
both are easy to inflate for marketing). Prefer `anthropics/skills`-hosted
skills or well-known, actively maintained repos. Keep the total skill count
small (3–5), matched to actual workflow — more skills means more context
overhead and more slash-command collisions, not more capability.

Currently configured for this project (project scope, shared via git):

- **[superpowers](https://github.com/obra/superpowers)** (`.claude/settings.json` →
  `extraKnownMarketplaces` / `enabledPlugins`) — enforces brainstorm-first,
  TDD-driven development discipline. New collaborators are prompted to
  install it once they trust this repo folder.
- **[Context7](https://github.com/upstash/context7)** (`.mcp.json`, HTTP
  transport at `https://mcp.context7.com/mcp`) — live library/framework
  documentation lookup, so Claude pulls current API docs instead of
  guessing from training data. No API key configured; add
  `CONTEXT7_API_KEY` locally if you hit rate limits.
