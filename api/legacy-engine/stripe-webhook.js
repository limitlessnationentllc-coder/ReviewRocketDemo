// Legacy Engine — Stripe webhook (deposit_paid stage gate)
//
// Configure in Stripe Dashboard -> Developers -> Webhooks:
//   URL: https://<your-domain>/api/legacy-engine/stripe-webhook
//   Events: checkout.session.completed
// Copy the signing secret into STRIPE_WEBHOOK_SECRET.

import Stripe from "stripe";

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("LEGACY_ENGINE_STRIPE_WEBHOOK_NOT_CONFIGURED");
    return res.status(503).end("Stripe not configured");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("LEGACY_ENGINE_STRIPE_WEBHOOK_SIGNATURE_ERROR", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};

    const record = {
      schema: "legacy-engine.stage-gate.v1",
      gate: { id: 6, name: "deposit_paid" },
      vertical: metadata.legacy_engine_vertical || "unknown",
      session_id: metadata.legacy_engine_session_id || "unknown",
      timestamp: new Date().toISOString(),
      metadata: {
        stripe_checkout_id: session.id,
        stripe_payment_intent: session.payment_intent,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details && session.customer_details.email,
        item_name: metadata.legacy_engine_item_name || null,
      },
    };
    console.log("LEGACY_ENGINE_STAGE_GATE " + JSON.stringify(record));
  } else {
    console.log("LEGACY_ENGINE_STRIPE_WEBHOOK_IGNORED_EVENT " + event.type);
  }

  return res.status(200).json({ received: true });
}
