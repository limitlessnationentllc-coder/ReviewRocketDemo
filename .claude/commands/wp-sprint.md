# /wp-sprint

**DiGiiBizz — WordPress Site Management + SEO Sprint**
Run the full 5-phase WordPress Sprint for a client site.

---

## Usage

```
/wp-sprint [SITE_URL] [LOCATION] [GSC_CSV_PATH]
```

**Arguments:**
- `SITE_URL` — the client's WordPress site URL (e.g., https://celticyurts.ie)
- `LOCATION` — target geographic scope for keyword targeting (e.g., "Ireland", "Dublin", "Isle of Man")
- `GSC_CSV_PATH` — path to the Google Search Console CSV export (last 28 days, all queries)

**Example:**
```
/wp-sprint https://example-hvac.ie "Dublin" ./gsc-export-hvac.csv
```

---

## What This Command Does

Executes all 5 phases of the DiGiiBizz WordPress Sprint in sequence. Each phase confirms before proceeding to the next.

---

## Phase Execution

### PHASE 1 — WP CONNECT

```
I have [SITE_URL] open in Chrome. If you can't see it, open it now.
Create a way for you to connect to this WordPress site programmatically
using a WordPress App Password via the REST API — or whatever method is best.
Confirm connection with an HTTP 200 response and list the first 5 pages you can see.
```

**Confirm:** CC returns page list via REST API before proceeding.

---

### PHASE 2 — CLIENT FEEDBACK (skip if none)

```
Here is outstanding client feedback for [SITE_URL]:
[PASTE FEEDBACK ITEMS]

Review the live site and apply all fixes directly via the REST API or
WordPress admin as appropriate. List each fix made and confirm completion.
```

**Confirm:** All feedback items resolved.

---

### PHASE 3 — SPEED SPRINT

**Step 3a — Diagnose:**
```
The website at [SITE_URL] is loading slowly. Diagnose the root cause.
Check: caching status, active plugins, server type, PHP version,
image compression, render-blocking assets. List findings. Discuss before fixing anything.
```

**Step 3b — Fix (after diagnosis confirmed):**
```
Go ahead and fix the caching issue.
1. Install and activate the appropriate full-page cache plugin for this server type.
2. Remove any unused plugins identified (migration tools, coming soon, inactive themes).
3. Run front-end optimization: minify CSS and JS, compress images where possible.
4. After cache is active, pull the full sitemap and warm every URL — all pages, posts, and service pages.
Confirm response time before and after.
```

**Confirm:** Response time under 100ms cached. Sitemap warmed.

---

### PHASE 4 — SEO SPRINT

**Step 4a — Keyword Research:**
```
Here is the Google Search Console CSV for [SITE_URL] (last 28 days):
[ATTACH GSC_CSV]

Using the Semrush connector:
1. Identify the top keyword opportunities by search volume for [LOCATION] only.
2. Flag existing queries where the site ranks position 4–20 (quick win territory).
3. Flag any high-volume keywords the site has no current ranking for.
4. Synthesize findings into a prioritized list with estimated monthly volume.
Report back — do not make any changes yet.
```

**Step 4b — One-Shot Metadata (after synthesis confirmed):**
```
Based on the keyword synthesis, update the following across ALL key pages
(homepage, service pages, about, contact — skip blog posts):
- Meta title (60 chars max, lead with primary keyword)
- Meta description (155 chars max, include secondary keyword + location + CTA)
- H1 tag (match or closely mirror meta title intent)

Target location: [LOCATION] only.
Use the REST API to apply all changes directly.
Confirm each page updated with old value → new value logged.
```

**Confirm:** Spot-check 3 pages in browser. Confirm title tags visible in page source.

---

### PHASE 5 — CONTENT GAP + INDEXING

**Step 5a — New Page Identification:**
```
Based on the keyword data from Phase 4:
Identify 3–5 new service or product pages this site should have but doesn't.
Requirements:
- Transactional intent only (people looking to buy, hire, or enquire)
- No blog posts — service and product pages only
- Minimum estimated monthly search volume: 100+
- Specific to [LOCATION] or nationally relevant with local modifier possible

For each recommendation provide:
- Suggested page title
- Target primary keyword + volume
- Target secondary keyword + volume
- Suggested URL slug
- One-line rationale

List recommendations. Do not create pages yet.
```

**Step 5b — Create Pages (after selection confirmed):**
```
Create the following pages on [SITE_URL]:
[PASTE SELECTED PAGES FROM 5a]

For each page:
- Create via REST API with appropriate template
- Add optimized meta title, meta description, H1
- Write a short placeholder body (3–5 paragraphs) targeting the primary keyword
- Add to site navigation if appropriate
Confirm each page created with live URL.
```

**Step 5c — Indexing Check:**
```
Check the indexing status of the following pages via Google Search Console:
[LIST ALL KEY PAGES + NEW PAGES CREATED]

Flag any that are not indexed. I will submit unindexed pages manually.
```

**Manual step:** Submit unindexed pages in Google Search Console UI.

---

## Completion Checklist

Before closing the sprint, confirm all items:

- [ ] WP connected via App Password — credentials stored securely
- [ ] Client feedback items resolved
- [ ] Caching active, response time confirmed under 100ms cached
- [ ] Unused plugins removed
- [ ] Sitemap fully warmed
- [ ] Meta titles updated — all key pages
- [ ] Meta descriptions updated — all key pages
- [ ] H1 tags updated — all key pages
- [ ] New pages created and live
- [ ] Indexing checked — unindexed pages submitted
- [ ] Sprint summary logged for client delivery

---

## Sprint Summary Template (send to client)

```
WordPress Site Sprint — [BUSINESS NAME] — [DATE]

SPEED
- Before: [X]s load time
- After: [X]ms cached

SEO METADATA
- Pages updated: [X]
- Primary target: [KEYWORD] — [LOCATION]

NEW PAGES CREATED
- [Page 1]: targeting [keyword]
- [Page 2]: targeting [keyword]

INDEXING
- [X] pages confirmed indexed
- [X] pages submitted for indexing

NEXT: Expect Search Console movement in 4–8 weeks.
Monthly retainer available to maintain and build on this — $200/month, no contract.
```

---

## Notes

- Store App Password in credentials file immediately after Phase 1 — never leave in chat history
- LiteSpeed Cache only works on LiteSpeed servers — confirm server type in Phase 3 diagnosis
- Cache warmup only covers sitemap URLs — pages not in sitemap will not be pre-cached
- GSC indexing submission must be done manually — CC cannot submit to GSC directly
- Homepage metadata changes carry ranking risk if page is already performing — confirm client accepts before Phase 4b
- Semrush connector must be active in CC before starting Phase 4

---

*DiGiiBizz Internal — WordPress Site Management + SEO Sprint v1.0*
