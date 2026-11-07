# Vercel build plan — U.S. Open Netball standings & results

**Status: built and verified Sat Nov 7, 2026.** Both scrapers and the standings UI are implemented; see README.md for how the pipeline actually runs. Kept for the reasoning and the acceptance checks.

Supersedes the architecture decisions in `HANDOVER.md` §2. Written Sat Nov 7, 2026, mid-tournament.

**Decisions taken:** standings come from the existing GitHub feed (handover Option A). Match results come from a new scrape of NetballConnect's Schedules page.

**Assumption to confirm:** the fixtures scraper is added to the **existing `joshpugh/us-open-netball` repo**, publishing JSON next to the ladder feeds. Option A was chosen to keep a headless browser off Vercel, and that repo's Playwright setup is the only environment where NetballConnect is *proven* to load. Vercel stays browser-free and reads three static feeds. The alternative — running the fixtures scrape in a Vercel function — is Option B and is deferred to post-event work (see §6).

---

## 0. Groundwork (blocking, ~10 min)

The project is not deployable as it stands:

- `node_modules` is **not installed** → `npm install`
- the folder is **not a git repository** → `git init`, commit, push to a new GitHub repo
- confirm `npm run build` and `npx tsc --noEmit` pass before touching anything

## 1. Standings adapter — the live feed (~45 min)

Feeds (verified live, CORS open, refreshing every ~10 min):

```
https://joshpugh.github.io/us-open-netball/data/ladies.json
https://joshpugh.github.io/us-open-netball/data/mixed.json
```

**Extend `lib/scores/types.ts`.** The ladder carries fields `Standing` has no home for. Add as optional so the existing `csv`/`sample`/`json` adapters keep compiling:

```ts
export type Standing = {
  team: string;
  p: number; w: number; d: number; l: number;
  gf: number; ga: number; pts?: number;
  rank?: number;      // the source's own ranking (includes H2H, which we cannot recompute)
  logo?: string;      // hotlinked Google Cloud Storage URL
  form?: string;      // "WWLWD", latest game FIRST
  next?: string;      // opponent name, resolved from the Next column's logo
  nextLogo?: string;
};
```

**New `lib/scores/netballconnect.ts`** implementing `ScoresAdapter`:

- fetch both feeds in parallel; map `f`→`gf`, `a`→`ga`, pass `pts`, `rank`, `form`, `next`, `logo` straight through
- emit two `Pool`s: `{ division: "Ladies", group: "Ladies", name: "" }` and the Mixed equivalent
- **preserve the feed's row order** — do not re-sort. `rank` already encodes NetballConnect's tiebreakers (Points → H2H → For-Against → Goals For); H2H is not derivable from the feed, so any local sort would eventually disagree with the official ladder.
- `updatedAt` = the **older** of the two feeds' `updated` values, so the displayed time never overstates freshness
- one feed down → serve the other and set `error`; both down → throw and let `getScores()` catch it
- register in the `ADAPTERS` map in `lib/scores/index.ts`; set `SCORES_PROVIDER=netballconnect`

Two existing behaviours to keep in mind:

- `index.ts` only calls `standingsFromFinals()` when `pools` is **empty**, so returning real pools correctly suppresses the derived ones.
- `pts` now comes from the source, so the `POINTS_WIN` env guard no longer gates the Pts column for this adapter. That is the desired outcome — real points instead of a guessed rule — but it is a deliberate change in when Pts appears.

## 2. Standings UI (~1 hr)

Rebuild `Board` in `components/Scores.tsx` to the handover §6 column set:

`#` · Team (logo + name) · P · W · L · D · F · A · GD (green +, red −) · Pts (bold, accent) · Form (last 5 chips) · Next (opponent logo, hover title)

- **Form:** render the first 5 characters only; the source string is longer and is latest-first.
- **Logos:** hotlinked from NetballConnect's GCS bucket. Add an `onError` handler that hides the image so a dead URL never shows a broken-image icon.
- **Responsive via CSS container queries**, sized to the table's container rather than the viewport: ≤720px hide D, F, A, Next · ≤500px also hide Form, tighten padding, 22px logos · ≤340px also hide L and the "updated" time. No horizontal scroll at 375px; long team names wrap.
- Put this CSS in **`app/site.css`**. `app/tokens.css` and `app/components.css` are vendored copies of the design system and local edits there will be lost.
- Drop the "Final scores"/"Up next" empty-state copy that currently reads *"No ladies games have finished yet. First games start at 8:20 AM PT on Saturday"* — it is wrong once matches exist but a feed is briefly down.

## 3. Fixtures scraper (~2 hr — the riskiest part)

**Source page** (discovered via the Schedules tab; not in the handover):

```
https://registration.netballconnect.com/liveScoreSeasonFixture
  ?organisationKey=d04c4ad3-d2ae-403c-8d31-637bc1fd3e4a
  &competitionUniqueKey=18ae8f74-51e4-4a5d-8ce8-09aaae90220f
  &yearId=8&locked=1&hideFinder=1&hideRegionSwitcher=1
  &divisionId={34705|34704}&column=long
```

### Two findings that change the handover's advice

1. **`column=long` is mandatory, and it is a URL parameter — not a width effect.** The ladder page defaults to `column=short`, which renders only Rank/Team/P/PTS/H2H/GD. The handover's scraper matches columns by header text, so under `short` it silently finds no W/L/D/F/A/Form/Next and writes **zeros** rather than failing. Pin `column=long` explicitly on both the ladder and fixtures URLs, and keep a wide viewport as a second line of defence. This is worth patching in the existing ladder scraper too.
2. **Rows have stable structural hooks, but the class names are CSS-module hashes.** Match by *prefix*, never by the full name, because the suffix rotates whenever NetballConnect rebuilds its frontend:

| Data | Selector |
|---|---|
| match row | `[class*="styles_matchRow__"]` |
| date / time | `[class*="styles_matchStartDatetime__"]` / `[class*="styles_matchStartTime__"]` |
| home · score · away | `[class*="styles_matchResult__"]` → its three child `.ant-col`s, in order |
| match ID, group | `[class*="styles_matchId__"]` |

### Parsing rules

- **Read the score from its own cell, never with a regex over the row's text.** A naive `(\d+)\s*:\s*(\d+)` over `innerText` matches the *kick-off time* — `06:45 PM` parses as a 6–45 scoreline. This mistake silently corrupted 30 of 66 rows in testing.
- **Unplayed matches render the score cell as a single `-`.** That is the status test: two integers → `status: "final"`; anything else → `"upcoming"` with `score: null`.
- Map onto the existing `Match` type: `id` = NetballConnect's Match ID (stable and unique — far better than an array index), `court` = venue with the `Henderson Sport and Social-` prefix stripped, `division` = the Group value trimmed of its trailing `" ."`, `pool` = the `Round N` heading above the row, `start` = date + time combined at `-08:00` (the page labels times PST).
- Ladies (34705) currently has 11 rounds / 66 matches; the last of Saturday's is 6:45 PM PST.

### Guards (handover §5, extended)

Throw — and keep the last good file — if: zero rows parse; any row is missing a team name; or the count of *played* matches is **lower** than the last good file. That third guard catches a half-rendered page, which is the failure mode most likely to publish a plausible-looking but wrong table. Only write when the data actually changed.

Publish `data/fixtures-ladies.json` and `data/fixtures-mixed.json` on the same 10-minute schedule, then have the Vercel adapter merge: `pools` from the ladder feeds, `matches` from the fixtures feeds.

## 4. Deploy (~20 min)

1. Push to GitHub → Vercel **Add New → Project** → import; Next.js is auto-detected, defaults are correct.
2. Environment variables: `SCORES_PROVIDER=netballconnect`, `NEXT_PUBLIC_STREAM_DAY1=sgTG8qF8O-Q`, and `NEXT_PUBLIC_STREAM_DAY2` once Sunday's broadcast ID exists.
3. **Verify on the preview deployment before promoting.** This is also where you confirm Vercel's IPs can reach `joshpugh.github.io` (they can — it is static hosting) rather than NetballConnect, which is no longer on Vercel's path under this design.
4. Optionally raise `/api/scores` from `s-maxage=20` to `s-maxage=60`: upstream only moves every ~10 minutes, so the tighter window buys nothing and costs origin invocations. Harmless either way.
5. **Leave DNS alone until the Wix site is ready to retire.** `next.config.mjs` already 308-redirects the eight old Wix paths; adding `usopennetball.com` mid-tournament is the one genuinely irreversible step here.

## 5. Acceptance checks

From handover §7, with one correction:

- [ ] Ladies and Mixed top 4 match the live NetballConnect page on P, Pts, GD and Form
- [ ] **Compare against the feed's `updated` timestamp, not the live page's current state.** The feed legitimately trails the ladder by up to 10 minutes — during testing the feed had San Francisco Stars at rank 1 while the live page already had them at rank 3, purely because a game had finished in between. Treat a mismatch as a failure only if the numbers disagree *for the same timestamp*.
- [ ] Data refreshes within ~10 minutes of a result changing
- [ ] A forced feed failure leaves the last good table showing, not a blank or an error
- [ ] No horizontal scroll at 375px; columns drop as listed in §2
- [ ] A broken logo URL hides itself

## 6. Sequencing and risk

**The tournament is live right now.** Round 11 of 11 plays tonight and finals are Sunday. That argues for shipping in two passes:

1. **Now:** §0 → §1 → §2 → §4. Standings only, reading a feed that is already proven in production. Nothing new can break the data pipeline, and the site is live and correct within a couple of hours.
2. **After:** §3, the fixtures scraper. It is new scraping against selectors that have never run unattended, and a bad deploy mid-event would publish wrong scores — the one outcome worse than showing no scores.

Standing risks:

- **The GitHub Actions job is production's single point of failure.** Handover §8 says to switch those workflows off after the tournament — do **not**, until the scrapers have moved into Vercel (Option B). Amend that note.
- **CSS-module hashes rotate.** Prefix selectors plus the §3 guards plus last-good-value fallback are the mitigation; none of them prevent a silent schema change, so the guards matter more than the selectors.
- **Do not call `api-netball.squadi.com` directly.** It 403s anything that is not their own site, and the handover is explicit about not forging `Origin`/`Referer` to get around it. Loading the public page in a browser is what a visitor's browser does; spoofing headers to reach a closed API is not. For a real feed, Netball America can ask Squadi for API access as competition owner.
- **For 2027** the `competitionUniqueKey`, `yearId` and both `divisionId`s change. Read them off the public ladder URL after choosing the competition and group in NetballConnect's dropdowns. A Playoffs group exists as a third dropdown entry; its ID is still uncaptured and no `playoffs.json` feed is published.
