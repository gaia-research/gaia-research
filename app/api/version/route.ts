export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  const commitSha =
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    "unknown";

  return Response.json(
    {
      commitSha,
      status: "ok",
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
