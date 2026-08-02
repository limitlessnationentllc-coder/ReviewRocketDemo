# DIGIIBIZZ — WORDPRESS SITE SPRINT
# Master Execution Prompt v1.0
# Paste this into Claude Code. Fill in the three variables at the top. CC runs the rest.

---

## BEFORE YOU START — FILL THESE IN

```
SITE_URL: [https://client-site.com]
LOCATION: [City / County / Region — e.g., "Dublin", "Ireland", "Isle of Man"]
GSC_CSV: [drag CSV file into CC or paste path — e.g., ./gsc-export.csv]
```

---

## PROMPT (paste everything below this line into Claude Code)

---

You are executing a DiGiiBizz WordPress Site Sprint for the following client:

SITE_URL: [SITE_URL]
TARGET LOCATION: [LOCATION]
GSC DATA: [GSC_CSV attached]

You will run 5 phases in sequence. Before starting each new phase, state which phase you are beginning and confirm the previous phase is complete. Do not proceed to the next phase until the current phase is confirmed successful. If you hit an error, stop, report it clearly, and wait for instruction.

---

## PHASE 1 — WP CONNECT

Open [SITE_URL] in Chrome. If you cannot see it, open it now.

Create a connection to this WordPress site using a WordPress App Password via the REST API — or the best available method. Do not install any plugin to achieve this unless there is no other option.

When connected:
- Confirm HTTP 200 response
- List the first 5 pages you can see via REST API
- State the server type if detectable (LiteSpeed, Apache, Nginx, etc.)

STOP. Report connection status. Wait for confirmation before Phase 2.

---

## PHASE 2 — QUICK WINS

[SKIP THIS PHASE IF NO CLIENT FEEDBACK — state "Phase 2 skipped, no feedback provided" and move to Phase 3]

Review the live site at [SITE_URL]. Apply the following client feedback directly:

[PASTE CLIENT FEEDBACK HERE — or type NONE to skip]

For each fix:
- State what you found
- State what you changed
- Confirm the change is live

STOP. List all fixes completed. Wait for confirmation before Phase 3.

---

## PHASE 3 — SPEED SPRINT

### 3a. Diagnose

Audit the site performance at [SITE_URL]. Check:
- Full-page caching status (active plugin, type, configuration)
- Active plugins list — flag any that are unused, redundant, or known performance killers
- Server type and caching compatibility
- PHP rebuild behavior
- Any front-end asset issues (unminified CSS/JS, uncompressed images)

Report findings. Do not make any changes yet.

STOP. Present diagnosis. Wait for confirmation to proceed with fixes.

### 3b. Fix

Execute the following in order:

1. Install and activate the appropriate full-page cache plugin for this server type. If server is LiteSpeed, use LiteSpeed Cache. If Apache or Nginx, use WP Rocket equivalent available via REST or WP-CLI.

2. Remove plugins identified as unused or redundant. Do not remove any plugin unless you are confident it is inactive and not needed.

3. Run front-end optimization: minify CSS, minify JS, enable image lazy loading where not already active.

4. Pull the full XML sitemap from [SITE_URL]/sitemap.xml (or locate it if at a different path). Warm every URL in the sitemap — crawl each page so the cache is primed for real visitors.

5. Confirm response time for at least 3 key pages before and after caching.

Success threshold: cached pages respond in under 200ms. Report actual numbers.

STOP. Report speed results. List all plugins removed. Confirm sitemap warmed. Wait for confirmation before Phase 4.

---

## PHASE 4 — SEO SPRINT

### 4a. Keyword Research

Load the GSC CSV provided: [GSC_CSV]

Using the Semrush connector:

1. Pull search volume data for the top queries appearing in the GSC CSV
2. Identify additional keyword opportunities not in the GSC data but relevant to this site and location — focus on: service keywords, transactional intent, [LOCATION]-specific modifiers
3. Flag existing GSC queries ranking position 4–20 (quick win territory — one or two position gains = significant traffic)
4. Flag high-volume keywords the site has zero current ranking for
5. Note any keyword intent mismatches — pages ranking for keywords they are not optimized for

Synthesize into a prioritized opportunity list. Include: keyword, estimated monthly volume, current ranking if any, and recommended target page.

Do not make any changes to the site yet.

STOP. Present keyword synthesis. Wait for confirmation and any scope adjustments (location, keyword exclusions) before 4b.

### 4b. One-Shot Metadata Update

Based on the confirmed keyword synthesis, update ALL key pages on [SITE_URL]:

Pages to update: homepage, all service/product pages, about page, contact page. Skip blog posts unless specifically instructed.

For each page update:
- Meta title: 60 characters max. Lead with primary keyword. Include [LOCATION] where natural.
- Meta description: 155 characters max. Include secondary keyword + [LOCATION] + implicit CTA (e.g., "get a quote", "call today", "serving [LOCATION]").
- H1 tag: match or mirror meta title intent. Do not make it identical — slight variation is better.

Apply all changes directly via the WordPress REST API.

After updating each page, log:
OLD title → NEW title
OLD description → NEW description
OLD H1 → NEW H1

STOP. Present full update log. Wait for confirmation before Phase 5.

---

## PHASE 5 — CONTENT GAP + INDEXING

### 5a. New Page Recommendations

Based on the keyword data from Phase 4, identify 3–5 new pages this site should have but does not currently.

Requirements:
- Transactional intent only — people looking to hire, buy, or enquire
- Service and product pages only — no blog posts
- Minimum estimated monthly search volume: 100+ (lower acceptable if highly commercial)
- Specific to [LOCATION] or nationally relevant with local modifier applicable

For each recommendation provide:
- Suggested page title
- Target primary keyword + monthly volume
- Target secondary keyword + monthly volume  
- Suggested URL slug
- One-line rationale (why this page, why now)

STOP. Present recommendations. Wait for selection of which pages to create before 5b.

### 5b. Page Creation

Create the following pages on [SITE_URL] via the WordPress REST API:

[Pages will be confirmed after 5a — CC will receive list here]

For each page:
1. Create with appropriate page template (match existing site template style)
2. Set meta title, meta description, H1 per keyword targets
3. Write placeholder body content: minimum 300 words, structured with H2 subheadings, targeting primary keyword naturally throughout. Professional tone. No filler. Written for a [LOCATION]-based service business audience.
4. Set page status to published
5. Add to site navigation if it is a top-level service page

Confirm each page created with:
- Live URL
- Meta title confirmed
- Word count of body content

### 5c. Indexing Audit

Check the indexing status of ALL key pages — existing pages updated in Phase 4 plus new pages created in 5b.

List each page with status: INDEXED / NOT INDEXED / UNKNOWN

For pages not indexed, flag them clearly. I will submit these manually via Google Search Console.

STOP. Present full indexing report.

---

## SPRINT COMPLETE — GENERATE SUMMARY

When all 5 phases are confirmed complete, generate the following client-ready summary:

---

WORDPRESS SITE SPRINT SUMMARY
Client: [SITE_URL]
Date: [today's date]
Completed by: DiGiiBizz

SPEED
- Server type: [detected server]
- Cache installed: [plugin name]
- Before (uncached): [X]s average load
- After (cached): [X]ms average load
- Sitemap URLs warmed: [X] pages

PLUGINS REMOVED
- [list]

SEO METADATA
- Pages updated: [X]
- Primary keyword target: [keyword] — [LOCATION]
- Full update log: [attach or summarize]

NEW PAGES CREATED
[For each page: title, URL, target keyword]

INDEXING
- Indexed: [X] pages
- Submitted for indexing: [X] pages
- Outstanding (manual follow-up needed): [list if any]

WHAT TO EXPECT
Search Console impressions and clicks typically begin shifting within 4–8 weeks of changes going live and being indexed. New pages may take 6–12 weeks to establish rankings depending on competition.

NEXT STEP
Monthly maintenance retainer available at $200/month — covers ongoing Search Console monitoring, WordPress and plugin updates, GBP activity, minor site edits, and quarterly performance reports. No contract. 30 days written notice to cancel.

---

END OF SPRINT

---

## OPERATOR NOTES (not sent to CC)

- Store WordPress App Password in credentials file immediately after Phase 1 — never leave in CC chat history
- GSC indexing submission is manual — CC cannot submit to GSC directly — do this in Search Console UI after Phase 5c
- LiteSpeed Cache only works on LiteSpeed servers — if server is Apache/Nginx, confirm cache plugin choice with operator before install
- Homepage metadata changes carry ranking risk if page is already indexed and performing — get client acknowledgment before 4b if applicable
- Semrush connector must be active in CC before starting Phase 4 — confirm in CC tool list before running
