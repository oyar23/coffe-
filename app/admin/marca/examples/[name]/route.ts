import { readFile } from "node:fs/promises";
import path from "node:path";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const types: Record<string, string> = {
    "sample.mp4": "video/mp4",
    "sample.mp4.poster.jpg": "image/jpeg",
    "sample.json": "application/json",
  };
  if (!Object.hasOwn(types, name)) return new Response(null, { status: 404 });
  const bytes = await readFile(
    path.join(process.cwd(), "components/background/assets", name),
  );
  return new Response(bytes, {
    headers: {
      "Content-Type": types[name],
      "Cache-Control": "public, max-age=3600",
    },
  });
}
