// Legacy Engine — AI personalized cover generation
//
// Input: { vertical, itemName, year, ownerName, memory, photoDataUrl }
// Output: { ok, aiGenerated, provider, backgroundImage }
//
// The visitor's uploaded photo is composited client-side (see
// /legacy-engine/shared/funnel.js -> drawCoverToCanvas) on top of the
// `backgroundImage` this endpoint returns, so the photo itself is never
// sent to a third-party image model — only text describing the memory.
//
// If OPENAI_API_KEY is set, `backgroundImage` is a real AI-generated
// illustration from OpenAI's image API. If it is not set (e.g. this is
// still a pre-launch preview), a hand-tuned SVG gradient template is
// returned instead so the funnel keeps working end-to-end without any
// paid API key. See /docs/legacy-engine/PRD-STAGE-GATES.md go-live
// checklist: OPENAI_API_KEY must be set before a vertical goes live.

export const config = {
  maxDuration: 30,
};

const VERTICAL_COPY = {
  "collector-car": {
    scene:
      "a beautifully restored classic car parked at golden hour on a quiet open road, warm nostalgic light, gentle film grain, editorial automotive photography style",
    palette: ["#0b1d2e", "#c9702f", "#e4c878"],
    pattern: "pinstripe",
  },
  offshore: {
    scene:
      "a classic sportfishing boat cutting through calm open water at sunrise, warm brass and deep sea-blue tones, editorial nautical photography style",
    palette: ["#0b1d2e", "#2e6e8e", "#c9a24b"],
    pattern: "wave",
  },
};

function buildPrompt(vertical, itemName, year, memory) {
  const v = VERTICAL_COPY[vertical] || VERTICAL_COPY["collector-car"];
  const memorySnippet = (memory || "").toString().slice(0, 240);
  return (
    `A tasteful, painterly book-cover illustration background (no text, no people, no logos) of ${v.scene}. ` +
    `The subject evokes a ${year || ""} ${itemName || ""}. ` +
    `Mood inspired by this memory: "${memorySnippet}". ` +
    `Portrait orientation, cinematic lighting, rich but muted color grade, leaves clear negative space in the lower third for a photo inset and title text.`
  ).slice(0, 900);
}

async function generateWithOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1536",
        quality: "medium",
        n: 1,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`OpenAI image API ${response.status}: ${text.slice(0, 300)}`);
    }

    const json = await response.json();
    const b64 = json && json.data && json.data[0] && json.data[0].b64_json;
    if (!b64) throw new Error("OpenAI image API returned no image data");
    return `data:image/png;base64,${b64}`;
  } finally {
    clearTimeout(timeout);
  }
}

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[c]);
}

function templateBackground(vertical) {
  const v = VERTICAL_COPY[vertical] || VERTICAL_COPY["collector-car"];
  const [dark, mid, light] = v.palette;
  const patternShapes =
    v.pattern === "wave"
      ? `<path d="M0 900 Q 180 850 360 900 T 720 900 T 1080 900 V1536 H0 Z" fill="${mid}" opacity="0.18"/>
         <path d="M0 1000 Q 180 950 360 1000 T 720 1000 T 1080 1000 V1536 H0 Z" fill="${light}" opacity="0.14"/>`
      : `<g opacity="0.12" stroke="${light}" stroke-width="4">
           ${Array.from({ length: 14 })
             .map((_, i) => `<line x1="${i * 90 - 200}" y1="0" x2="${i * 90 + 200}" y2="1536" />`)
             .join("")}
         </g>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1536" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="90%">
      <stop offset="0%" stop-color="${mid}" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="${dark}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1536" fill="url(#bg)"/>
  ${patternShapes}
  <circle cx="860" cy="220" r="180" fill="${light}" opacity="0.08"/>
</svg>`;

  const base64 = Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const vertical = VERTICAL_COPY[body && body.vertical] ? body.vertical : "collector-car";
    const itemName = (body && body.itemName) || "";
    const year = (body && body.year) || "";
    const memory = (body && body.memory) || "";

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        ok: true,
        aiGenerated: false,
        provider: "template",
        backgroundImage: templateBackground(vertical),
      });
    }

    try {
      const prompt = buildPrompt(vertical, itemName, year, memory);
      const backgroundImage = await generateWithOpenAI(prompt);
      return res.status(200).json({
        ok: true,
        aiGenerated: true,
        provider: "openai",
        backgroundImage,
      });
    } catch (aiError) {
      console.error("LEGACY_ENGINE_COVER_AI_FALLBACK", aiError.message);
      return res.status(200).json({
        ok: true,
        aiGenerated: false,
        provider: "template-fallback",
        backgroundImage: templateBackground(vertical),
      });
    }
  } catch (error) {
    console.error("LEGACY_ENGINE_COVER_ERROR", error);
    return res.status(500).json({ ok: false, error: "COVER_GENERATION_FAILED" });
  }
}
