import { getScores } from "@/lib/scores";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getScores();
  return Response.json(data, {
    // Vercel's edge cache absorbs the crowd: at most one upstream hit per 20 seconds.
    headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" },
  });
}
