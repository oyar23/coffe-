import { readFile } from "node:fs/promises";
import path from "node:path";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^marca-[a-f0-9-]+\.(webp|json|mp4|mp4\.poster\.jpg)$/.test(name))
    return new Response(null, { status: 404 });
  try {
    const buffer = await readFile(
      path.join(process.cwd(), "public", "uploads", name),
    );
    const mime = name.endsWith(".json")
      ? "application/json"
      : name.endsWith(".mp4")
        ? "video/mp4"
        : name.endsWith(".jpg")
          ? "image/jpeg"
          : "image/webp";
    const headers = {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
    };
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) return new Response(null, { status: 416 });
      const start = Number(match[1]);
      const end = match[2]
        ? Math.min(Number(match[2]), buffer.length - 1)
        : buffer.length - 1;
      if (start > end || start >= buffer.length)
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${buffer.length}` },
        });
      return new Response(buffer.subarray(start, end + 1), {
        status: 206,
        headers: {
          ...headers,
          "Content-Range": `bytes ${start}-${end}/${buffer.length}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }
    return new Response(buffer, {
      headers: { ...headers, "Content-Length": String(buffer.length) },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
