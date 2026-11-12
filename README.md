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

**What actually triggers it.** GitHub's own `schedule:` is best-effort — on a new
repository it can take over an hour to start, and high-frequency crons get
deprioritised under load. Ours missed four slots in a row. So a **Vercel Cron**
(`vercel.json`) hits `/api/cron/scrape` every 10 minutes, and that route fires the
workflow via `workflow_dispatch`. Vercel schedules, GitHub still runs the browser.
The workflow keeps its own `schedule:` as a backstop; duplicate runs are harmless
because the scraper only writes when the data changed and the workflow's concurrency
group stops two publishing at once.

Three environment variables in Vercel:

| Variable | Purpose |
|---|---|
| `SCORES_PROVIDER` | `netballconnect` |
| `CRON_SECRET` | Vercel sends it as `Authorization: Bearer …` to the cron route, which 401s without it |
| `GITHUB_DISPATCH_TOKEN` | Fine-grained PAT, **this repo only**, **Actions: Read and write** — nothing else |

Keep that token minimal. Don't reuse a personal OAuth token with `repo` scope: this
one only needs to start a workflow, and it lives in a third-party service.

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

## After the tournament

The 2026 event is over, so the scraping is **dormant, not deleted** — every piece is
still in the repo and re-arming it is a few minutes:

| What | State | Re-arm |
|---|---|---|
| `.github/workflows/scrape.yml` | disabled | `gh workflow enable scrape.yml` |
| Vercel Cron | removed (`vercel.json` deleted) | recreate `vercel.json` with a `crons` entry for `/api/cron/scrape` |
| `/api/cron/scrape` | still deployed | nothing — it 401s without `CRON_SECRET` and 503s without `GITHUB_DISPATCH_TOKEN` |
| `CRON_SECRET` | still set | left deliberately, so the route stays locked while idle |
| `GITHUB_DISPATCH_TOKEN` | never set | fine-grained PAT, this repo only, Actions: Read and write |

The published feed on GitHub Pages stays up and frozen at the final results, so the
site keeps rendering the completed 2026 competition with no moving parts.

### For 2027

Every competition identifier changes. Override these rather than editing the script —
read the new values off the public ladder URL after picking the competition and group
in NetballConnect's own dropdowns:

`NC_ORG_KEY`, `NC_COMP_KEY`, `NC_YEAR_ID`, `NC_DIVISION_LADIES`, `NC_DIVISION_MIXED`

2026's were: org `d04c4ad3-d2ae-403c-8d31-637bc1fd3e4a`, competition
`18ae8f74-51e4-4a5d-8ce8-09aaae90220f`, year `8`, Ladies `34705`, Mixed `34704`, and
**Playoffs `35741`** — the third group the original handover never captured. The
scraper only reads Ladies and Mixed; in 2026 the deciding rounds were added to those
two divisions, so the final ladder came out complete, but the Playoffs bracket itself
was never scraped. Worth deciding up front next year.

Note that GitHub's own `schedule:` trigger proved unreliable throughout: it fired three
times in the first seventeen hours against a `*/10` schedule, then settled at roughly
once every seven hours. That is why the Vercel Cron exists. Don't rely on `schedule:`
alone for live scores.
