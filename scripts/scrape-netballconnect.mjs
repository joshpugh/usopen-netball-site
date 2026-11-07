// Scrapes the public NetballConnect pages for the U.S. Open and writes JSON to data/.
//
//   node scripts/scrape-netballconnect.mjs
//
// Two pages per division, both rendered client-side, so a real browser is required:
//   livescorePublicLadder   -> data/ladder-<key>.json    (standings)
//   liveScoreSeasonFixture  -> data/fixtures-<key>.json  (match results)
//
// We load the same public pages a visitor loads. We deliberately do NOT call
// api-netball.squadi.com: it 403s anything that isn't their own site, and forging
// Origin/Referer to get around that is not something we do. If a proper feed is
// wanted, Netball America can ask Squadi for API access as the competition owner.
//
// Competition identifiers change every year. Override via env rather than editing code;
// read the new values off the public ladder URL after picking the competition and group
// in NetballConnect's own dropdowns.

import { chromium } from "playwright";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";

const ORG = process.env.NC_ORG_KEY || "d04c4ad3-d2ae-403c-8d31-637bc1fd3e4a";
const COMP = process.env.NC_COMP_KEY || "18ae8f74-51e4-4a5d-8ce8-09aaae90220f";
const YEAR = process.env.NC_YEAR_ID || "8";

const DIVISIONS = [
  { key: "ladies", label: "Ladies", id: process.env.NC_DIVISION_LADIES || "34705" },
  { key: "mixed", label: "Mixed", id: process.env.NC_DIVISION_MIXED || "34704" },
];

// column=long is REQUIRED. The page otherwise defaults to column=short, which renders
// only Rank/Team/P/PTS/H2H/GD. Because columns are matched by header text, a short
// render silently yields zeros for W/L/D/F/A/Form/Next instead of failing loudly.
const pageUrl = (path, id) =>
  `https://registration.netballconnect.com/${path}` +
  `?organisationKey=${ORG}&competitionUniqueKey=${COMP}&yearId=${YEAR}` +
  `&locked=1&hideFinder=1&hideRegionSwitcher=1&divisionId=${id}&column=long`;

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const OFFSETS = { PST: "-08:00", PDT: "-07:00", MST: "-07:00", MDT: "-06:00", CST: "-06:00", CDT: "-05:00", EST: "-05:00", EDT: "-04:00" };

// "Sat, Nov 7, 2026" + "08:00 AM (PST)" -> "2026-11-07T08:00:00-08:00"
function toIso(dateText, timeText) {
  const d = (dateText || "").match(/(\w{3})\s+(\d{1,2}),\s*(\d{4})/);
  const t = (timeText || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!d || !t) return undefined;
  const month = MONTHS[d[1].toLowerCase()];
  if (!month) return undefined;
  let hour = Number(t[1]) % 12;
  if (/pm/i.test(t[3])) hour += 12;
  const zone = (timeText.match(/\(([A-Z]{3,4})\)/) || [])[1];
  const offset = OFFSETS[zone] || "-08:00";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d[3]}-${pad(month)}-${pad(Number(d[2]))}T${pad(hour)}:${t[2]}:00${offset}`;
}

async function openPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  return page;
}

// ── Standings ───────────────────────────────────────────────────────────────
async function scrapeLadder(browser, division) {
  const page = await openPage(browser, pageUrl("livescorePublicLadder", division.id));
  await page.waitForSelector("table tbody tr td", { timeout: 60000 });
  await page.waitForTimeout(2000); // let the table finish rendering

  const result = await page.$$eval("table", (tables) => {
    const table = tables.find((t) => t.querySelector("tbody tr td"));
    if (!table) return { error: "no table" };
    const num = (s) => (s === "" || isNaN(Number(s)) ? 0 : Number(s));
    // Match columns by header text, never by position: the page reorders and merges
    // columns depending on width and the column= parameter.
    const heads = [...table.querySelectorAll("thead th")].map((th) =>
      th.innerText.replace(/\s+/g, " ").trim().toLowerCase());
    const col = (test) => heads.findIndex(test);
    const i = {
      rank: col((h) => h.startsWith("rank")),
      team: col((h) => h.includes("team")),
      p: col((h) => h === "p"), w: col((h) => h === "w"), l: col((h) => h === "l"), d: col((h) => h === "d"),
      f: col((h) => h === "f"), a: col((h) => h === "a"), pts: col((h) => h === "pts"), gd: col((h) => h === "gd"),
      form: col((h) => h.includes("last 5") || h.includes("latest")),
      next: col((h) => h === "next"),
    };
    // Explicitly detect a short-column render rather than silently writing zeros.
    const missing = ["w", "l", "d", "f", "a"].filter((k) => i[k] < 0);
    if (missing.length) return { error: `columns missing: ${missing.join(",")} (headers: ${heads.join("|")})` };

    const rows = [...table.querySelectorAll("tbody tr")]
      .map((tr) => [...tr.querySelectorAll("td")])
      .filter((c) => c.length > 5);
    const txt = (c, k) => (i[k] >= 0 && c[i[k]] ? c[i[k]].innerText.trim() : "");
    const img = (c, k) => (i[k] >= 0 && c[i[k]] ? (c[i[k]].querySelector("img")?.src || null) : null);

    const logoToName = {};
    const teams = rows.map((c) => {
      let rank, name;
      if (i.rank === i.team) { // combined "Rank Team" column
        const [r, ...n] = txt(c, "team").split("\n");
        rank = r; name = n.join(" ").trim();
      } else {
        rank = txt(c, "rank"); name = txt(c, "team").replace(/\s+/g, " ").trim();
      }
      const logo = img(c, "team");
      if (logo) logoToName[logo] = name;
      return {
        rank: num(rank), name, logo,
        p: num(txt(c, "p")), w: num(txt(c, "w")), l: num(txt(c, "l")), d: num(txt(c, "d")),
        f: num(txt(c, "f")), a: num(txt(c, "a")), pts: num(txt(c, "pts")), gd: num(txt(c, "gd")),
        form: txt(c, "form").replace(/[^WLD]/g, ""), // latest game first
        nextLogo: img(c, "next"),
      };
    });
    teams.forEach((t) => (t.next = logoToName[t.nextLogo] || ""));
    return { teams };
  });

  await page.close();
  if (result.error) throw new Error(`ladder: ${result.error}`);
  const teams = result.teams;
  if (!teams.length) throw new Error("ladder: no rows parsed");
  if (teams.some((t) => !t.name)) throw new Error("ladder: a team name was empty");
  return teams;
}

// ── Match results ───────────────────────────────────────────────────────────
async function scrapeFixtures(browser, division) {
  const page = await openPage(browser, pageUrl("liveScoreSeasonFixture", division.id));
  await page.waitForSelector('[class*="styles_matchRow__"]', { timeout: 60000 });
  await page.waitForTimeout(2000);

  const raw = await page.evaluate(() => {
    // Class names are CSS-module hashes (styles_matchRow__lzBWH): the suffix changes on
    // every NetballConnect frontend build, so match on the stable prefix only.
    const isRow = (el) => typeof el.className === "string" && /styles_matchRow__/.test(el.className);
    const pick = (el, frag) => el.querySelector(`[class*="${frag}"]`);
    const out = [];
    let round = "";
    // One ordered pass so each row inherits the "Round N" heading above it.
    for (const el of document.querySelectorAll("*")) {
      if (!el.children.length && /^Round\s+\d+$/i.test((el.textContent || "").trim())) {
        round = el.textContent.trim();
        continue;
      }
      if (!isRow(el)) continue;

      const text = el.innerText || "";
      const idBlocks = [...el.querySelectorAll('[class*="styles_matchId__"]')].map((b) => b.innerText).join("\n");
      const id = (idBlocks.match(/Match\s*ID\s*:\s*(\d+)/i) || [])[1] || "";
      const group = ((idBlocks.match(/Group\s*:\s*(.+)/i) || [])[1] || "").replace(/\s*\.\s*$/, "").trim();

      const dateText = (pick(el, "styles_matchStartDatetime__")?.innerText || "").trim();
      const timeText = (pick(el, "styles_matchStartTime__")?.innerText || "").trim();

      // Read the score from its OWN cell. A regex over the row text matches the
      // kick-off time instead: "06:45 PM" parses as a 6-45 scoreline.
      const resultBlock = pick(el, "styles_matchResult__");
      const cols = resultBlock ? [...resultBlock.children] : [];
      const cell = (n) => (cols[n] ? cols[n].innerText.replace(/\s+/g, " ").trim() : "");
      const home = cell(0), scoreText = cell(1), away = cell(2);

      // An unplayed match renders its score cell as a single "-".
      const score = scoreText.match(/^(\d+)\s*[:\-–]\s*(\d+)$/);
      const court = (text.match(/Court\s*([\w-]+)/i) || [])[0] || "";

      out.push({
        id, round, group, home, away, court: court.trim(),
        start: { dateText, timeText },
        homeScore: score ? Number(score[1]) : null,
        awayScore: score ? Number(score[2]) : null,
        scoreText,
        cols: cols.length,
      });
    }
    return out;
  });

  await page.close();
  if (!raw.length) throw new Error("fixtures: no match rows parsed");

  const seen = new Set();
  const matches = [];
  for (const r of raw) {
    if (!r.home || !r.away) throw new Error(`fixtures: match ${r.id || "?"} is missing a team name`);
    if (r.cols !== 3) throw new Error(`fixtures: match ${r.id || "?"} had ${r.cols} result columns, expected 3`);
    if (!r.id || seen.has(r.id)) continue; // Match IDs are stable and unique
    seen.add(r.id);
    // A match shows "-" until scoring opens, then "0 : 0" the moment it does, so a 0-0
    // means IN PROGRESS, not a result. The official ladder confirms it: it counts Played
    // for every round except the 0-0 one. Netball finals run 8-2, 22-1 and the like, so a
    // genuine 0-0 full-time score doesn't occur; treating one as unplayed is the safe error.
    const live = r.homeScore === 0 && r.awayScore === 0;
    const played = r.homeScore !== null && r.awayScore !== null && !live;
    matches.push({
      id: r.id,
      round: r.round || undefined,
      court: r.court || undefined,
      start: toIso(r.start.dateText, r.start.timeText),
      status: played ? "final" : "upcoming",
      home: { team: r.home, score: r.homeScore },
      away: { team: r.away, score: r.awayScore },
    });
  }
  if (!matches.length) throw new Error("fixtures: every row was skipped");
  return matches;
}

// ── Write only on change, and never regress ─────────────────────────────────
function save(file, payload, countPlayed) {
  if (existsSync(file)) {
    const prev = JSON.parse(readFileSync(file, "utf8"));
    const { updated: _a, ...prevBody } = prev;
    const { updated: _b, ...nextBody } = payload;
    if (JSON.stringify(prevBody) === JSON.stringify(nextBody)) return "no change";
    if (countPlayed) {
      // A half-rendered page is the failure mode most likely to publish a
      // plausible-but-wrong table, so refuse to lose completed games.
      const before = countPlayed(prev), after = countPlayed(payload);
      if (after < before) throw new Error(`refusing to regress: ${before} -> ${after} completed`);
    }
  }
  writeFileSync(file, JSON.stringify(payload, null, 1));
  return "saved";
}

mkdirSync("data", { recursive: true });
const browser = await chromium.launch();
let ok = 0, failed = 0;

for (const division of DIVISIONS) {
  for (const job of ["ladder", "fixtures"]) {
    try {
      const updated = new Date().toISOString();
      if (job === "ladder") {
        const teams = await scrapeLadder(browser, division);
        const status = save(`data/ladder-${division.key}.json`, { updated, division: division.label, teams },
          (p) => (p.teams || []).reduce((n, t) => n + (t.p || 0), 0));
        console.log(`${division.key} ladder: ${status} (${teams.length} teams)`);
      } else {
        const matches = await scrapeFixtures(browser, division);
        const status = save(`data/fixtures-${division.key}.json`, { updated, division: division.label, matches },
          (p) => (p.matches || []).filter((m) => m.status === "final").length);
        const played = matches.filter((m) => m.status === "final").length;
        console.log(`${division.key} fixtures: ${status} (${matches.length} matches, ${played} played)`);
      }
      ok++;
    } catch (e) {
      failed++;
      console.error(`${division.key} ${job}: ${e.message}`); // keep the last good file
    }
  }
}

await browser.close();

// Cross-check the two pages against each other. They are scraped independently, so if
// the number of completed games per team disagrees with the ladder's Played column,
// one of them has been misread -- which is exactly how the "0 : 0 means in progress"
// case first showed up. A warning, not a failure: a scrape mid-round can legitimately
// disagree for a few minutes, and stale-but-consistent data beats no data.
for (const division of DIVISIONS) {
  try {
    const lf = `data/ladder-${division.key}.json`, ff = `data/fixtures-${division.key}.json`;
    if (!existsSync(lf) || !existsSync(ff)) continue;
    const ladder = JSON.parse(readFileSync(lf, "utf8"));
    const fixtures = JSON.parse(readFileSync(ff, "utf8"));
    const played = {};
    for (const m of fixtures.matches.filter((x) => x.status === "final")) {
      played[m.home.team] = (played[m.home.team] || 0) + 1;
      played[m.away.team] = (played[m.away.team] || 0) + 1;
    }
    const off = ladder.teams
      .map((t) => ({ team: t.name, ladder: t.p, fixtures: played[t.name] || 0 }))
      .filter((r) => r.ladder !== r.fixtures);
    if (off.length) {
      console.warn(`${division.key}: WARNING ladder/fixtures disagree on games played:`);
      for (const r of off) console.warn(`    ${r.team}: ladder ${r.ladder}, fixtures ${r.fixtures}`);
    } else {
      console.log(`${division.key}: ladder and fixtures agree on games played`);
    }
  } catch (e) {
    console.warn(`${division.key}: cross-check skipped (${e.message})`);
  }
}

console.log(`done: ${ok} ok, ${failed} failed`);
if (!ok) process.exit(1); // nothing at all succeeded
