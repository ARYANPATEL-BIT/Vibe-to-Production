// Uptime monitors ping this. If it stops answering, you hear about it before customers do.
export function GET() {
  return Response.json({ status: "ok", version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" });
}
