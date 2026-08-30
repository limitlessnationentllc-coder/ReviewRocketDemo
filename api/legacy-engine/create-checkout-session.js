// Legacy Engine — $25 refundable reservation deposit (Stripe Checkout)
//
// Requires STRIPE_SECRET_KEY in the Vercel project's environment
// variables. Uses Stripe's hosted Checkout (redirect to session.url),
// so no Stripe.js / publishable key is needed on the client for Phase 1.
//
// The deposit is explicitly framed as fully refundable in both the
// product copy and the Checkout description. Refunds are processed
// manually via the Stripe dashboard for the MVP — see
// /docs/legacy-engine/PRD-STAGE-GATES.md go-live checklist.

import Stripe from "stripe";

const RESERVATION_PRICE_CENTS = 2500;

const VERTICAL_LABELS = {
  "collector-car": "Collector Car Legacy",
  offshore: "Offshore Legacy",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("LEGACY_ENGINE_STRIPE_NOT_CONFIGURED");
    return res.status(503).json({
      ok: false,
      error: "STRIPE_NOT_CONFIGURED",
      message: "Reservations aren't live yet — checkout isn't configured.",
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const vertical = VERTICAL_LABELS[body && body.vertical] ? body.vertical : "collector-car";
    const email = body && body.email;
    const sessionId = (body && body.session_id) || "unknown";
    const itemName = ((body && body.personalization && body.personalization.itemName) || "").slice(0, 200);
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: typeof email === "string" && email.includes("@") ? email : undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: RESERVATION_PRICE_CENTS,
            product_data: {
              name: `${VERTICAL_LABELS[vertical]} — Reservation Deposit`,
              description:
                "Fully refundable $25 deposit to reserve your personalized Legacy Engine keepsake. " +
                "Refundable in full any time before your final order is confirmed.",
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        description: `Legacy Engine ${VERTICAL_LABELS[vertical]} reservation deposit (fully refundable)`,
      },
      metadata: {
        legacy_engine_vertical: vertical,
        legacy_engine_session_id: sessionId,
        legacy_engine_item_name: itemName,
      },
      success_url: `${origin}/legacy-engine/${vertical}/success.html?checkout_session_id={CHECKOUT_SESSION_ID}&le_session=${encodeURIComponent(sessionId)}`,
      cancel_url: `${origin}/legacy-engine/${vertical}/index.html?checkout=cancelled`,
    });

    console.log(
      "LEGACY_ENGINE_CHECKOUT_STARTED " +
        JSON.stringify({
          schema: "legacy-engine.checkout-session.v1",
          vertical,
          session_id: sessionId,
          stripe_checkout_id: checkoutSession.id,
          created_at: new Date().toISOString(),
        })
    );

    return res.status(200).json({ ok: true, url: checkoutSession.url });
  } catch (error) {
    console.error("LEGACY_ENGINE_CHECKOUT_ERROR", error);
    return res.status(500).json({ ok: false, error: "CHECKOUT_SESSION_FAILED" });
  }
}
