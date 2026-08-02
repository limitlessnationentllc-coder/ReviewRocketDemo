# DIGIIBIZZ — CONTENT INTELLIGENCE PROMPT
# YouTube Transcript + Screenshot → Business Framework Extractor v1.0
# Use in Claude.ai chat (not Claude Code). Paste prompt + attach transcript/screenshots.

---

## HOW TO USE

1. Copy everything in the PROMPT section below
2. Paste into Claude.ai
3. Replace [PASTE TRANSCRIPT HERE] with the video transcript text
4. Attach any screenshots from the video (chapter list, tool outputs, keyword data, UI screens)
5. Send — Claude extracts and structures everything into your framework

---

## PROMPT

---

You are processing a YouTube video into a structured business intelligence document for DiGiiBizz — a local SEO and AI automation agency serving blue-collar service businesses (auto repair, towing, HVAC, tree service, landscaping).

Your job is to extract everything actionable from this content and organize it into a reusable business framework. Do not summarize casually. Extract with precision. Every section should produce something I can use, build from, or hand to a VA.

---

## INPUT

TRANSCRIPT:
[PASTE TRANSCRIPT HERE]

SCREENSHOTS ATTACHED: [yes/no — describe what's visible if yes]

---

## EXTRACTION FRAMEWORK

Work through each section in order. Do not skip sections. If a section has no relevant content from this video, write "Nothing extracted — not covered in this video."

---

### 1. VIDEO INTELLIGENCE BRIEF

- Source URL (if known):
- Channel / Creator (if known):
- Core topic in one sentence:
- Primary workflow demonstrated:
- Tools shown or mentioned:
- Target audience of the video (who it was made for):
- Relevance to DiGiiBizz client base (high / medium / low — and why):

---

### 2. WORKFLOW EXTRACTION

Extract every step shown or described in the video as a numbered, sequential workflow. Be specific. Do not generalize. If the creator showed exact prompts, commands, or inputs — capture them verbatim or as close as possible.

Format:
**Step N — [Name]**
What was done: [exact action]
Tool used: [tool name]
Input: [what was fed in]
Output: [what came out]
Time taken (if mentioned): [X min]

---

### 3. PROMPT TEMPLATES EXTRACTED

List every prompt, command, or instruction the creator gave to an AI tool — verbatim or reconstructed from context. Make them reusable by replacing specific details with [PLACEHOLDERS].

Format:
**Prompt [N] — Phase/Purpose**
```
[prompt text with placeholders]
```
Notes: [any context needed to use this prompt correctly]

---

### 4. TOOLS & STACK

List every tool mentioned or shown. For each:
- Tool name
- What it was used for in this video
- Required? / Optional? / Alternative available?
- Already in DiGiiBizz stack? (Claude Code, WordPress, Semrush, GSC, GoHighLevel, Base44, Vercel, Supabase, Railway — yes/no/partial)

---

### 5. RESULTS & PROOF POINTS

Extract every concrete result mentioned — numbers, before/after comparisons, timelines, traffic changes, revenue claims. Flag anything unverified or self-reported.

Format:
- [Metric]: [before] → [after] ([timeframe]) [VERIFIED / SELF-REPORTED / UNVERIFIED]

---

### 6. PRODUCTIZED SERVICE MAPPING

Map what was demonstrated in the video to a potential DiGiiBizz service offering.

- Service name (what you'd call it to a client):
- What it delivers (client-facing outcome):
- Time to deliver (estimated):
- Pricing tier it fits (one-time sprint / $200/month retainer / $500/month growth):
- Which client types it applies to (auto repair / towing / HVAC / tree service / landscaping / all):
- Upsell path from this service:

---

### 7. SOP SKELETON

Extract enough detail to write a Standard Operating Procedure. Identify:

- Trigger (when do you run this?):
- Prerequisites (access, tools, data needed before starting):
- Phases with names and estimated time:
- Success signals (how do you know each phase worked?):
- Known failure points or risks:
- Completion deliverable to client:

---

### 8. GAPS & UNKNOWNS

What did the video NOT cover that would be needed to fully execute this workflow?
What assumptions did the creator make that may not apply to your client base?
What would need to be tested or verified before productizing this?

---

### 9. FOUR DELIVERABLES NEEDED

Based on this extraction, list exactly what needs to be built to fully productize this as a DiGiiBizz service:

- [ ] SOP document (internal)
- [ ] Service page copy (for DiGiiBizz website or proposal)
- [ ] Client pitch email (cold / warm / post-delivery variants)
- [ ] Claude Code slash command or master prompt

Flag which of these are worth building now vs. later based on how ready the workflow is.

---

### 10. SCREENSHOT INTELLIGENCE (if screenshots provided)

For each screenshot attached, extract:
- What is visible (UI, data, output, tool name)
- Any specific data points, keyword volumes, metrics, or results shown
- How this supplements or clarifies the transcript

If no screenshots provided, skip this section.

---

## OUTPUT FORMAT

Return all 10 sections in order. Use the exact section headers above. Be dense and specific — this document will be used to build SOPs, service pages, and client pitches. Write for an operator who needs to execute, not a reader who needs to be impressed.

---

*DiGiiBizz Content Intelligence Framework v1.0*
