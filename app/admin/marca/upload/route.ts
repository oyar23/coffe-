import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { validateLottie } from "@/components/background/validateLottie";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== request.headers.get("host"))
      return NextResponse.json(
        { error: "La subida debe hacerse desde esta aplicación." },
        { status: 403 },
      );
    if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024)
      return NextResponse.json(
        { error: "Archivo demasiado grande." },
        { status: 413 },
      );
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if (!(file instanceof File) || file.size === 0)
      throw Error("Elegí un archivo.");
    const bytes = Buffer.from(await file.arrayBuffer());
    let output: Buffer;
    let extension: string;
    if (kind === "video") {
      if (
        file.type !== "video/mp4" ||
        file.size > 3 * 1024 * 1024 ||
        bytes.toString("ascii", 4, 8) !== "ftyp"
      )
        throw Error("Usá MP4 H.264 de hasta 3 MB y 1280 × 720.");
      let found = false;
      for (
        let index = bytes.indexOf("tkhd");
        index >= 0;
        index = bytes.indexOf("tkhd", index + 4)
      ) {
        const size = bytes.readUInt32BE(index - 4);
        const end = index - 4 + size;
        if (size < 84 || end > bytes.length) continue;
        const width = bytes.readUInt32BE(end - 8) / 65536;
        const height = bytes.readUInt32BE(end - 4) / 65536;
        if (width && height) {
          if (Math.max(width, height) > 1280 || Math.min(width, height) > 720)
            throw Error("El video supera 720p.");
          found = true;
        }
      }
      if (!found)
        throw Error("No se pudieron verificar las dimensiones del MP4.");
      output = bytes;
      extension = "mp4";
    } else if (kind === "lottie") {
      if (file.size > 300000) throw Error("Lottie debe pesar hasta 300 KB.");
      const json = JSON.parse(bytes.toString("utf8"));
      validateLottie(json);
      output = Buffer.from(JSON.stringify(json));
      extension = "json";
    } else {
      if (
        file.size > 5 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
        throw Error("Usá JPG, PNG o WebP de hasta 5 MB.");
      output = await sharp(bytes, { limitInputPixels: 40000000 })
        .rotate()
        .resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer();
      extension = "webp";
    }
    const name = `marca-${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    if (kind === "video") {
      const poster = form.get("poster");
      if (!(poster instanceof File) || poster.size > 1024 * 1024)
        throw Error("Falta el poster del video.");
      const image = await sharp(Buffer.from(await poster.arrayBuffer()))
        .resize({ width: 1280, height: 720, fit: "inside" })
        .jpeg({ quality: 80 })
        .toBuffer();
      await writeFile(path.join(directory, `${name}.poster.jpg`), image);
    }
    await writeFile(path.join(directory, name), output);
    return NextResponse.json({ src: `/admin/marca/media/${name}` });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo subir el archivo.",
      },
      { status: 400 },
    );
  }
}
