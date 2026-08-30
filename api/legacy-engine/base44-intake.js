// Legacy Engine — Base44 intake handoff (post-reservation, full order details)
//
// STUB — Phase 1: the Base44 MCP connector was not yet authorized when this
// was built, so this endpoint just resolves a configured Base44 form URL
// per vertical and appends prefill query params. Once Base44 access is
// authorized, replace the body of this handler with a direct Base44 API
// call (e.g. creating a prefilled submission / record instead of a
// query-string handoff) — the request/response contract below can stay
// the same so the success-page client code doesn't need to change.
//
// Configure via Vercel env vars:
//   BASE44_INTAKE_URL_COLLECTOR_CAR
//   BASE44_INTAKE_URL_OFFSHORE

const ENV_KEY_BY_VERTICAL = {
  "collector-car": "BASE44_INTAKE_URL_COLLECTOR_CAR",
  offshore: "BASE44_INTAKE_URL_OFFSHORE",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const vertical = ENV_KEY_BY_VERTICAL[body && body.vertical] ? body.vertical : "collector-car";
    const baseUrl = process.env[ENV_KEY_BY_VERTICAL[vertical]];

    console.log(
      "LEGACY_ENGINE_INTAKE_HANDOFF " +
        JSON.stringify({
          schema: "legacy-engine.intake-handoff.v1",
          vertical,
          session_id: (body && body.session_id) || "unknown",
          email: (body && body.email) || null,
          checkout_session_id: (body && body.checkout_session_id) || null,
          base44_configured: Boolean(baseUrl),
          at: new Date().toISOString(),
        })
    );

    if (!baseUrl) {
      return res.status(200).json({ ok: true, configured: false, url: null });
    }

    const url = new URL(baseUrl);
    if (body.email) url.searchParams.set("email", body.email);
    if (body.session_id) url.searchParams.set("le_session", body.session_id);
    if (body.checkout_session_id) url.searchParams.set("stripe_checkout_id", body.checkout_session_id);
    if (body.personalization && body.personalization.itemName) {
      url.searchParams.set("item_name", body.personalization.itemName);
    }
    if (body.personalization && body.personalization.year) {
      url.searchParams.set("year", body.personalization.year);
    }
    if (body.personalization && body.personalization.ownerName) {
      url.searchParams.set("owner_name", body.personalization.ownerName);
    }
    url.searchParams.set("vertical", vertical);

    return res.status(200).json({ ok: true, configured: true, url: url.toString() });
  } catch (error) {
    console.error("LEGACY_ENGINE_INTAKE_ERROR", error);
    return res.status(500).json({ ok: false, error: "INTAKE_HANDOFF_FAILED" });
  }
}
