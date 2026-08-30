// Legacy Engine — email capture (post cover-preview, pre-checkout)
//
// Always logs the lead as a structured record first (so no lead is ever
// lost if SMTP isn't configured yet), then best-effort emails the owner
// via the same SMTP env vars already used by /api/send-lead.js.

import nodemailer from "nodemailer";

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (body && body._hp) {
      return res.status(200).json({ ok: true });
    }

    const email = body && body.email;
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "INVALID_EMAIL" });
    }

    const vertical = (body && body.vertical) || "unknown";
    const sessionId = (body && body.session_id) || "unknown";
    const personalization = (body && body.personalization) || {};

    const record = {
      schema: "legacy-engine.lead.v1",
      vertical,
      session_id: sessionId,
      email,
      personalization,
      captured_at: new Date().toISOString(),
    };
    console.log("LEGACY_ENGINE_LEAD_CAPTURED " + JSON.stringify(record));

    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.OWNER_EMAIL) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT || 465),
          secure: process.env.SMTP_SECURE === "true" || true,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
          from: process.env.FROM_EMAIL || process.env.SMTP_USER,
          to: process.env.OWNER_EMAIL,
          subject: `Legacy Engine (${vertical}): new preview lead — ${email}`,
          text:
            `New Legacy Engine cover-preview lead\n\n` +
            `Vertical: ${vertical}\n` +
            `Email: ${email}\n` +
            `Session: ${sessionId}\n\n` +
            `Personalization:\n${JSON.stringify(personalization, null, 2)}`,
        });
      } catch (mailError) {
        console.error("LEGACY_ENGINE_LEAD_MAIL_ERROR", mailError.message);
        // Never fail the request over a notification email — the lead is
        // already durably logged above.
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("LEGACY_ENGINE_LEAD_ERROR", error);
    return res.status(500).json({ ok: false, error: "LEAD_CAPTURE_FAILED" });
  }
}
