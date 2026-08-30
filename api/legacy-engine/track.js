// Legacy Engine — stage-gate analytics sink
//
// Every funnel step posts a "legacy-engine.stage-gate.v1" event here.
// Phase 1 MVP: events are emitted as single-line structured JSON via
// console.log, which Vercel captures in the project's Runtime Logs /
// Log Drains. This keeps the MVP dependency-free; swapping in a real
// warehouse (Vercel Log Drain -> BigQuery/Snowflake, or Segment) later
// is a drop-in replacement for the persist() call below.
//
// See /docs/legacy-engine/PRD-STAGE-GATES.md for the full gate schema.

const VALID_GATES = new Set([
  "page_view",
  "ad_click",
  "form_start",
  "form_complete",
  "cover_generated",
  "email_captured",
  "checkout_start",
  "deposit_paid",
  "intake_start",
  // Experiment #001 (Collector Car Legacy redesign) — see PRD-STAGE-GATES.md
  "imagine_yours_started",
  "imagine_yours_cover_rendered",
  "imagine_yours_cta_clicked",
  "demo_switcher_used",
  "preview_step_1_completed",
  "preview_step_2_completed",
  "preview_step_3_completed",
  "personalized_book_viewed",
  "personalized_story_viewed",
  "offer_viewed",
  "reservation_clicked",
  "exit_message_shown",
  "exit_message_clicked",
]);

const VALID_VERTICALS = new Set(["collector-car", "offshore", "unknown"]);

function persist(event) {
  // Single-line JSON so it's grep-able / parseable from Vercel log streams.
  console.log("LEGACY_ENGINE_STAGE_GATE " + JSON.stringify(event));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({ ok: false, error: "INVALID_BODY" });
    }

    const gateName = body.gate && body.gate.name;
    if (!VALID_GATES.has(gateName)) {
      return res.status(400).json({ ok: false, error: "UNKNOWN_GATE" });
    }

    const vertical = VALID_VERTICALS.has(body.vertical) ? body.vertical : "unknown";

    const event = {
      schema: "legacy-engine.stage-gate.v1",
      gate: body.gate,
      vertical,
      session_id: String(body.session_id || "unknown").slice(0, 128),
      timestamp: body.timestamp || new Date().toISOString(),
      received_at: new Date().toISOString(),
      page: typeof body.page === "string" ? body.page.slice(0, 256) : null,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
      ip: (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || null,
      user_agent: req.headers["user-agent"] || null,
    };

    persist(event);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("LEGACY_ENGINE_TRACK_ERROR", error);
    // Analytics failures must never surface to the visitor as an error.
    return res.status(200).json({ ok: false });
  }
}
