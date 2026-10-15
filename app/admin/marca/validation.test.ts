import test from "node:test";
import assert from "node:assert/strict";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { POST } from "./upload/route";
import { GET } from "./media/[name]/route";
import { validateLottie } from "@/components/background/validateLottie";
const base = "http://localhost:3013";
const created: string[] = [];
async function upload(
  kind: string,
  bytes: Buffer,
  mime: string,
  poster?: Buffer,
) {
  const form = new FormData();
  form.set("kind", kind);
  form.set("file", new File([new Uint8Array(bytes)], `example`, { type: mime }));
  if (poster)
    form.set(
      "poster",
      new File([new Uint8Array(poster)], "poster.jpg", { type: "image/jpeg" }),
    );
  const response = await POST(
    new Request(`${base}/admin/marca/upload`, {
      method: "POST",
      headers: { origin: base, host: "localhost:3013" },
      body: form,
    }),
  );
  const data = await response.json();
  if (data.src) {
    created.push(path.basename(data.src));
    if (kind === "video") created.push(`${path.basename(data.src)}.poster.jpg`);
  }
  return { response, data };
}
test("uploads, video mobile budget, posters and media ranges", async () => {
  try {
    const folder = path.join(process.cwd(), "components/background/assets");
    const video = await readFile(path.join(folder, "sample.mp4"));
    const poster = await readFile(path.join(folder, "sample.mp4.poster.jpg"));
    const lottie = await readFile(path.join(folder, "sample.json"));
    const image = await upload("image", poster, "image/jpeg");
    assert.equal(image.response.status, 200);
    assert.match(image.data.src, /\.webp$/);
    const animation = await upload("lottie", lottie, "application/json");
    assert.equal(animation.response.status, 200);
    const movie = await upload("video", video, "video/mp4", poster);
    assert.equal(movie.response.status, 200);
    const name = path.basename(movie.data.src);
    const partial = await GET(
      new Request(base, { headers: { range: "bytes=0-31" } }),
      { params: Promise.resolve({ name }) },
    );
    assert.equal(partial.status, 206);
    assert.equal((await partial.arrayBuffer()).byteLength, 32);
    const still = await GET(new Request(base), {
      params: Promise.resolve({ name: `${name}.poster.jpg` }),
    });
    assert.equal(still.headers.get("content-type"), "image/jpeg");
    assert.equal(
      (
        await upload(
          "video",
          Buffer.alloc(3 * 1024 * 1024 + 1),
          "video/mp4",
          poster,
        )
      ).response.status,
      400,
    );
    const oversized = Buffer.from(video);
    const track = oversized.indexOf("tkhd");
    const end = track - 4 + oversized.readUInt32BE(track - 4);
    oversized.writeUInt32BE(1920 * 65536, end - 8);
    assert.equal(
      (await upload("video", oversized, "video/mp4", poster)).response.status,
      400,
    );
    assert.equal(
      (await upload("lottie", Buffer.alloc(300001), "application/json"))
        .response.status,
      400,
    );
    assert.equal(
      (await upload("image", Buffer.from("fake"), "image/jpeg")).response
        .status,
      400,
    );
    assert.equal(
      (
        await GET(new Request(base), {
          params: Promise.resolve({ name: "../menu.db" }),
        })
      ).status,
      404,
    );
  } finally {
    await Promise.all(
      created.map((name) =>
        unlink(path.join(process.cwd(), "public/uploads", name)),
      ),
    );
  }
});
test("Lottie permits easing coordinates and rejects expressions/external assets", () => {
  const valid = { v: "5.12", fr: 30, layers: [{ o: { x: 0.42, y: 0 } }] };
  assert.doesNotThrow(() => validateLottie(valid));
  assert.throws(() =>
    validateLottie({ ...valid, layers: [{ x: "time*100" }] }),
  );
  assert.throws(() =>
    validateLottie({ ...valid, assets: [{ p: "https://example.com/a.png" }] }),
  );
  assert.throws(() => validateLottie({ ...valid, layers: Array(61).fill({}) }));
});
