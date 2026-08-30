# Legacy Engine — Setup & Environment Variables

This covers what needs to be configured in Vercel (Project → Settings →
Environment Variables) before each vertical can go live. See
`PRD-STAGE-GATES.md` for the full go-live checklist and approval gate.

## URLs

| Vertical | Path |
|---|---|
| Collector Car Legacy | `/collector-car-legacy` |
| Offshore Legacy | `/offshore-legacy` |

Both are static pages under `/legacy-engine/<vertical>/index.html`, made
reachable at the pretty slugs above via rewrites in `vercel.json`.

## Environment variables

### AI cover generation (optional — has a graceful fallback)

| Var | Required for | Notes |
|---|---|---|
| `OPENAI_API_KEY` | Real AI-generated cover art | Without this, `/api/legacy-engine/generate-cover.js` returns a branded SVG template instead so the funnel still works end-to-end during development/demo. |

### Stripe — $25 refundable reservation deposit

| Var | Required for | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Checkout session creation | Use a `sk_test_...` key while testing, `sk_live_...` only once approved to go live. |
| `STRIPE_WEBHOOK_SECRET` | Confirming `deposit_paid` | From Stripe Dashboard → Developers → Webhooks → your endpoint's signing secret. |

**Webhook endpoint to register in Stripe:**
`https://<your-domain>/api/legacy-engine/stripe-webhook`, subscribed to
`checkout.session.completed`.

Without `STRIPE_SECRET_KEY` set, the reservation button shows a friendly
"reservations open very soon" message instead of erroring — safe to
preview before Stripe is wired up.

### Base44 — full order intake (post-reservation)

| Var | Required for | Notes |
|---|---|---|
| `BASE44_INTAKE_URL_COLLECTOR_CAR` | Intake CTA on Collector Car success page | Full URL to the Base44 form/app for this vertical. |
| `BASE44_INTAKE_URL_OFFSHORE` | Intake CTA on Offshore success page | Full URL to the Base44 form/app for this vertical. |

Phase 1 note: this repo's Base44 integration
(`/api/legacy-engine/base44-intake.js`) is a **stub** — it resolves the
configured URL above and appends prefill query params (`email`,
`le_session`, `stripe_checkout_id`, `item_name`, `year`, `owner_name`,
`vertical`). Once the Base44 MCP connector is authorized for this project,
swap that handler's body for a direct Base44 API call (e.g. creating a
prefilled record instead of a query-string handoff); the request/response
shape can stay the same so the success-page client code doesn't change.

If these env vars are unset, the success page shows "we'll email you the
form" instead of a broken link.

### Email notifications (leads + reservations)

Reuses the same SMTP vars as the existing Review Rocket demo
(`api/send-lead.js`):

| Var |
|---|
| `SMTP_HOST` (default `smtp.gmail.com`) |
| `SMTP_PORT` (default `465`) |
| `SMTP_USER` |
| `SMTP_PASS` |
| `FROM_EMAIL` |
| `OWNER_EMAIL` |

If unset, leads are still durably logged (see below) — email notification
is best-effort on top of that.

## Analytics

No third-party analytics account is required for the MVP. Every funnel
step is logged as structured JSON via `console.log` from the relevant
serverless function (prefixed `LEGACY_ENGINE_STAGE_GATE`,
`LEGACY_ENGINE_LEAD_CAPTURED`, etc.) — visible under Vercel → your project
→ **Logs**. Optionally, add a Google Analytics / GTM `dataLayer` consumer:
`legacy-engine/shared/analytics.js` already pushes every event to
`window.dataLayer`, so dropping a GTM container snippet into each page's
`<head>` is enough to pick these events up with zero code changes.

To graduate past console logs: connect a Vercel Log Drain to your
warehouse of choice and filter on the `LEGACY_ENGINE_` prefixes.

## Local/preview testing without any secrets

The funnel is designed to run fully end-to-end with **zero** environment
variables set:
- Cover generation falls back to a branded SVG template.
- The reservation button shows a "coming soon" message instead of calling
  Stripe.
- The Base44 CTA shows a "we'll email you" fallback.
- Leads are still logged to Vercel function logs even without SMTP.

This means both verticals can be demoed on a Vercel preview deployment
immediately, before any of the above credentials exist.
