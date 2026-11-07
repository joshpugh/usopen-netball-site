// Vercel Cron -> GitHub workflow_dispatch.
//
// GitHub's own `schedule:` trigger is best-effort: on a new repository it can take an
// hour or more to warm up, and high-frequency crons get deprioritised under load. Ours
// missed four slots in a row. Vercel's scheduler is reliable, so it drives the trigger
// while GitHub's runner still does the scraping (which needs a real browser).
//
// The workflow keeps its own `schedule:` as a belt-and-braces. Duplicate runs are
// harmless: the scraper only writes when the data actually changed, and the workflow's
// concurrency group stops two publishing at once.

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const REPO = process.env.GITHUB_DISPATCH_REPO || "joshpugh/usopen-netball-site";
const WORKFLOW = process.env.GITHUB_DISPATCH_WORKFLOW || "scrape.yml";
const REF = process.env.GITHUB_DISPATCH_REF || "main";

export async function GET(req: Request) {
  // Vercel sends `Authorization: Bearer $CRON_SECRET` to cron routes whenever that env
  // var is set. The route is publicly routable, so without this anyone could spam it.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return Response.json(
      { ok: false, error: "GITHUB_DISPATCH_TOKEN is not set", hint: "Fine-grained PAT, this repo only, Actions: Read and write" },
      { status: 503 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: REF }),
      cache: "no-store",
    });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "dispatch failed" }, { status: 502 });
  }

  // GitHub answers 204 No Content on a successful dispatch.
  if (res.status !== 204) {
    const body = await res.text().catch(() => "");
    return Response.json({ ok: false, status: res.status, body: body.slice(0, 300) }, { status: 502 });
  }

  return Response.json({ ok: true, dispatched: `${REPO}/${WORKFLOW}@${REF}`, at: new Date().toISOString() });
}
