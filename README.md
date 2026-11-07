# U.S. Open Netball Championships® — website

Next.js 15 (App Router) site for Vercel. All copy and links live in `content/site.ts`; styles come from the **U.S. Open Netball** design system (`app/tokens.css` and `app/components.css` are copies of its tokens and component CSS).

## Deploy (about 5 minutes)

1. Push this folder to a new GitHub repo.
2. In Vercel, choose **Add New → Project**, import the repo, and keep the defaults (Framework: Next.js).
3. Under **Settings → Environment Variables**, add the values from `.env.example` (at minimum, `SCORES_PROVIDER`).
4. Under **Settings → Domains**, add `usopennetball.com` and `www.usopennetball.com`, then point DNS at Vercel as it instructs. Do this only once the Wix site is ready to retire.

Old Wix URLs (`/event`, `/book-hotel`, `/2025-results`, `/mixed-results`, `/results-1`, `/sponsors`, `/get-involved` and `/media`) 308-redirect to their new homes, so existing links and search results keep working.

## Results

Live standings and match results come from NetballConnect, which publishes no API, so
two public pages are scraped with a headless browser and the output is served as JSON.

**The pipeline**

1. `.github/workflows/scrape.yml` runs `scripts/scrape-netballconnect.mjs` every 10 minutes.
2. It scrapes two pages per division — the ladder (standings) and the season fixture list
   (match results) — and writes `data/*.json`.
3. That folder is published to **GitHub Pages**, not committed. Committing it would trigger
   a Vercel deployment every 10 minutes; publishing to Pages touches no branch.
4. The site reads those URLs through `lib/scores/netballconnect.ts`, behind the
   `/api/scores` edge cache.

Enable once: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

**Scraper notes** (the non-obvious parts — see the script's comments for the rest)

- `column=long` is mandatory on both URLs. The pages otherwise default to `column=short`,
  which drops W/L/D/F/A/Form/Next. Because columns are matched by header text, a short
  render yields silent zeros rather than an error.
- Row class names are CSS-module hashes (`styles_matchRow__lzBWH`); the suffix changes on
  every NetballConnect rebuild, so selectors match the stable prefix only.
- A score of `0 : 0` means **in progress**, not a result. A match shows `-` until scoring
  opens and `0 : 0` the moment it does. The ladder's Played column confirms it, and the
  script cross-checks the two pages against each other on every run.
- Guards: it refuses to publish a table with no rows, a missing team name, or fewer
  completed games than last time, keeping the last good file instead.

Competition identifiers change each year. Override `NC_ORG_KEY`, `NC_COMP_KEY`,
`NC_YEAR_ID`, `NC_DIVISION_LADIES` and `NC_DIVISION_MIXED` rather than editing the script;
read the new values off the public ladder URL after picking the competition in
NetballConnect's own dropdowns.

**Other sources.** `SCORES_PROVIDER` also accepts `sample` (placeholder data), `csv`
(Google Sheets) and `json` (a feed already shaped like `ScoresPayload`). Adapters live in
`lib/scores/`; add one and register it in `lib/scores/index.ts`.

Run it locally with `node scripts/scrape-netballconnect.mjs` (needs `npx playwright install chromium`).

## Streams

Set `NEXT_PUBLIC_STREAM_DAY2` to Sunday's YouTube video ID when Netball America creates the broadcast, then redeploy (Vercel → Deployments → Redeploy). Until then, the Sunday tab shows a "goes up Sunday morning" card.

## Local

```
npm install
npm run dev
```
