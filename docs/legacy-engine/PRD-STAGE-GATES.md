# Legacy Engine — Phase 1 MVP PRD & Stage-Gate Log

**Status:** Built, awaiting go-live approval per vertical.
**Note on source material:** the task referenced a "KnowledgeOS PRD structure"
for logging and stage gates. No such document exists in this repository or
anywhere else available to this build, and the user confirmed there isn't
one to hand off. The structure below is therefore an original stage-gate
design authored for this MVP, following standard PRD conventions (named
gates, entry/exit criteria, a structured event schema, and a go-live
checklist). If a real KnowledgeOS PRD surfaces later, reconcile the schema
below against it before treating this as canonical.

## 1. Product summary

**Brand:** Legacy Engine — "Preserve what moves you."
Two independent verticals sharing one brand shell, funnel structure, and
analytics pipeline, differentiated only by copy, imagery, and URL slug:

| Vertical | Slug | Sample product |
|---|---|---|
| Collector Car Legacy ("The Machine & The Memories") | `/collector-car-legacy` | 1967 Mustang — "The Restoration of Sam's Mustang" |
| Offshore Legacy ("The Captain's Archive") | `/offshore-legacy` | 1988 Bertram 33 — "Captain Mike's Wide Open" |

Each vertical's funnel: hero → sample preview → personalization micro-form
→ AI-generated cover preview → email capture → $25 refundable reservation
(Stripe) → Base44 intake (full order details).

## 2. Stage-gate model

Every funnel is modeled as a sequence of gates. A gate fires exactly one
structured event when its exit criteria are met. Gates are cumulative —
gate N should not fire for a session that never fired gate N-1, and the
funnel UI enforces this by construction (steps are shown in order).

| Gate | Event name | Exit criteria | Where logged |
|---|---|---|---|
| 0 | `ad_click` | Visitor lands with `utm_source`, `gclid`, or `fbclid` present | client → `/api/legacy-engine/track` |
| 0 | `page_view` | Any page load | client → `/api/legacy-engine/track` |
| 1 | `form_start` | Visitor focuses any personalization field | client → `/api/legacy-engine/track` |
| 2 | `form_complete` | Personalization form submitted with all required fields | client → `/api/legacy-engine/track` |
| 3 | `cover_generated` | AI (or template-fallback) cover preview successfully rendered to the visitor | client → `/api/legacy-engine/track` |
| 4 | `email_captured` | Valid email submitted and accepted by `/api/legacy-engine/capture-email` | client → `/api/legacy-engine/track` |
| 5 | `checkout_start` | Visitor clicks the $25 reservation CTA, before redirect to Stripe | client → `/api/legacy-engine/track` |
| 6 | `deposit_paid` | Stripe confirms `checkout.session.completed` | **server (Stripe webhook)** → authoritative, not client-reported |
| 7 | `intake_start` | Visitor opens the Base44 intake form from the success page | client → `/api/legacy-engine/track` |

`deposit_paid` is intentionally the one gate not trusted to client-side
reporting — it is only logged from the Stripe webhook
(`/api/legacy-engine/stripe-webhook.js`) after Stripe itself confirms
payment, so the funnel's revenue-truth gate cannot be spoofed or lost to a
dropped client request.

## 3. Event schema (`legacy-engine.stage-gate.v1`)

```json
{
  "schema": "legacy-engine.stage-gate.v1",
  "gate": { "id": 2, "name": "form_complete" },
  "vertical": "collector-car | offshore",
  "session_id": "le_<ts>_<rand>",
  "timestamp": "ISO-8601",
  "page": "/collector-car-legacy",
  "metadata": { "...gate-specific fields..." }
}
```

Phase 1 sink: every event is written as a single-line JSON record
(`LEGACY_ENGINE_STAGE_GATE {...}`) via `console.log` inside the relevant
serverless function, which Vercel captures under Project → Logs. This is
deliberately dependency-free for the MVP. To graduate to a real warehouse:
pipe a Vercel Log Drain to your analytics sink (BigQuery, Snowflake, or a
tool like Segment/PostHog), filtering on the `LEGACY_ENGINE_STAGE_GATE`
prefix — no application code changes required, since `persist()` in
`/api/legacy-engine/track.js` is the single choke point.

Leads (email + personalization) are separately logged as
`legacy-engine.lead.v1` records from `/api/legacy-engine/capture-email.js`,
and are also emailed to `OWNER_EMAIL` if SMTP is configured, so no lead is
ever dependent on the analytics pipeline alone.

## 4. Funnel-to-gate mapping (both verticals, identical structure)

```
Hero + sample preview
        │
        ▼
Personalization micro-form  ──(field focus)──▶ [Gate 1] form_start
  • item name, year, owner name
  • one photo upload
  • one memory field
        │ (submit)
        ▼
                              ─────────────────▶ [Gate 2] form_complete
AI cover generation (server)
        │
        ▼
Cover preview delivered      ──────────────────▶ [Gate 3] cover_generated
        │
        ▼
Email capture gate           ──(valid submit)──▶ [Gate 4] email_captured
        │
        ▼
$25 refundable reservation   ──(CTA click)─────▶ [Gate 5] checkout_start
  upsell (Stripe Checkout)
        │ (Stripe redirect + payment)
        ▼
Stripe webhook confirms      ──────────────────▶ [Gate 6] deposit_paid
        │
        ▼
Success page → Base44 intake ──(CTA click)─────▶ [Gate 7] intake_start
  (full order details)
```

## 5. Go-live checklist (must be re-run per vertical before flipping live)

Per the task instructions: **stop for explicit approval before going live
on each vertical.** "Live" here means: pointing real ad traffic at the
slug, and/or enabling Stripe **live mode** keys. Preview deployments and
Stripe **test mode** are fine to demo without this checklist being fully
green.

- [ ] `OPENAI_API_KEY` set in Vercel → AI cover generation is real, not the
      SVG template fallback (`generate-cover.js` degrades gracefully either
      way, but "AI-generated" copy on the page implies the real thing).
- [ ] `STRIPE_SECRET_KEY` set to a **live** key (not `sk_test_...`).
- [ ] `STRIPE_WEBHOOK_SECRET` set, and the webhook endpoint
      (`/api/legacy-engine/stripe-webhook`) added in the Stripe Dashboard
      for the production domain, subscribed to `checkout.session.completed`.
- [ ] A real $25 test transaction completed end-to-end in Stripe test mode
      and confirmed to appear as a `deposit_paid` log line.
- [ ] Refund policy copy reviewed by the business owner (refund process is
      manual via the Stripe Dashboard for Phase 1 — no self-serve refund
      button yet).
- [ ] `BASE44_INTAKE_URL_COLLECTOR_CAR` / `BASE44_INTAKE_URL_OFFSHORE` set
      once the Base44 connector is authorized and the intake form exists.
- [ ] SMTP vars (`SMTP_HOST/USER/PASS`, `OWNER_EMAIL`, `FROM_EMAIL`) set so
      leads and paid reservations reach a real inbox.
- [ ] Analytics sink reviewed — at minimum, someone is watching Vercel logs
      for `LEGACY_ENGINE_STAGE_GATE` lines; ideally a log drain is wired up.
- [ ] Domain / URL slug confirmed with the business owner.
- [ ] **Explicit go-live approval given by the user for this specific
      vertical.**

See `/docs/legacy-engine/SETUP.md` for exact env var names and where to get
each credential.

## 6. Experiment #001 — Collector Car Legacy redesign

A conversion-focused visual redesign of the Collector Car Legacy vertical
only (Offshore Legacy is untouched). Same brand, same backend contracts
(`generate-cover`, `capture-email`, cover compositing), new front-end:
an "Imagine Yours" instant cover render ahead of the intake, a restyled
3-step wizard, three fictional demo archives with an interactive spread
explorer, a redesigned book-object presentation, and tasteful abandonment
recovery. **UPDATE:** Collector Car's reservation CTA points at a real,
live Stripe Payment Link (`STRIPE_LINK_HERE` in
`legacy-engine/collector-car/experiment.js`) — a click charges a real
$25. Offshore was switched back to its original dynamic Stripe Checkout
Session flow (`create-checkout-session.js` / `stripe-webhook.js`),
pending a `STRIPE_SECRET_KEY` env var the user is providing separately —
until that's set, Offshore's button shows a "reservations open very
soon" message. Keep any deployment link-gated / unpublished regardless.
Lead-notification delivery to a real inbox still requires `OWNER_EMAIL`
(and SMTP credentials) to be set in Vercel — see below.

Additional stage gates, layered onto the model in section 2 (fractional
IDs place them relative to the original numbered gates without renumbering
anything already shipped):

| Gate ID | Event name | Exit criteria |
|---|---|---|
| 0.4 | `imagine_yours_started` | Visitor focuses any Imagine Yours field |
| 0.5 | `imagine_yours_cover_rendered` | Visitor fills all 4 quick fields and sees the instant dust-jacket render |
| 0.55 | `imagine_yours_cta_clicked` | Visitor clicks "Begin My Legacy Preview" from the Imagine Yours panel |
| 0.6 | `demo_switcher_used` | Visitor switches between demo archives, spread-explorer tabs, or the jacket reveal sequence |
| 1.1 | `preview_step_1_completed` | Step 1 (year/make/model/nickname/photo) submitted |
| 1.2 | `preview_step_2_completed` | Step 2 (memory) submitted |
| 2 | `preview_step_3_completed` | Step 3 (first name/email/consent) submitted — supersedes the original `form_complete` for this experiment's funnel shape |
| 3.1 | `personalized_book_viewed` | Personalized result screen (cover + photo) rendered |
| 3.2 | `personalized_story_viewed` | Visitor views the narrative/timeline portion of the result screen |
| 4.5 | `offer_viewed` | The Signature Archive offer section scrolls into view |
| 5 | `reservation_clicked` | Visitor clicks the (placeholder) reservation CTA |
| 8 | `exit_message_shown` | Exit-intent overlay or mobile bottom sheet is shown (once per session) |
| 8.1 | `exit_message_clicked` | Visitor clicks the recovery CTA inside that message |

### Go-live checklist addendum for Experiment #001

- [x] `STRIPE_LINK_HERE` swapped for a real Stripe Payment Link
      (`https://buy.stripe.com/8x27sL0XIfWe1LJeok7bW07`) on **Collector
      Car only** — clicking its reservation button charges a real $25.
      Revert to `"#"` to de-activate.
- [ ] Offshore reverted to its original dynamic `create-checkout-session.js`
      flow. Needs `STRIPE_SECRET_KEY` (user providing separately) and, for
      `deposit_paid` webhook confirmation, `STRIPE_WEBHOOK_SECRET` — see
      Stripe section of SETUP.md for the webhook endpoint to register.
- [ ] Set `OWNER_EMAIL=digiibizz@gmail.com` (plus `SMTP_USER`/`SMTP_PASS`/
      `FROM_EMAIL`) in Vercel so lead notifications from `capture-email.js`
      (shared by both verticals) actually reach that inbox — the
      `YOUR_EMAIL_HERE` constant in `experiment.js` is a reference label
      only and does not by itself route mail.
- [ ] Replace the three fictional demo archives' "fictional demonstration"
      labeling only if real customer archives are ever substituted.
- [ ] Re-run the full go-live checklist in section 5 before any production
      traffic — this experiment build is preview-only by design.
- [ ] Book visualization language is scoped to what Lulu can actually
      manufacture (linen hardcover, foil-stamped spine, removable
      photographic dust jacket, ~100–120 pages) after the print supplier
      confirmed a slipcase and full-cover debossing/embossing were not
      fulfillable as originally designed. Do not reintroduce slipcase or
      large-format deboss/emboss copy or imagery without re-confirming
      manufacturing capability first.
