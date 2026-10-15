import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export const runtime = 'nodejs';
const MAX_BYTES = 5 * 1024 * 1024;
const formats: Record<string, string> = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' };
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  let sameOrigin = false;
  try { sameOrigin = !!origin && new URL(origin).host === request.headers.get('host'); } catch { /* Origin inválido */ }
  if (!sameOrigin) return NextResponse.json({ error: 'La subida debe hacerse desde esta aplicación.' }, { status: 403 });
  if (Number(request.headers.get('content-length')) > MAX_BYTES + 65536) return NextResponse.json({ error: 'La imagen debe pesar hasta 5 MB.' }, { status: 413 });
  let file: FormDataEntryValue | null;
  try { file = (await request.formData()).get('file'); }
  catch { return NextResponse.json({ error: 'No se pudo leer el archivo.' }, { status: 400 }); }
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: 'Elegí una imagen.' }, { status: 400 });
  if (!formats[file.type]) return NextResponse.json({ error: 'Usá una imagen JPG, PNG o WebP.' }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'La imagen debe pesar hasta 5 MB.' }, { status: 413 });
  let output: Buffer;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(buffer, { limitInputPixels: 40000000, animated: false }).metadata();
    if (meta.format !== formats[file.type] || !meta.width || !meta.height) throw new Error('Formato inválido');
    output = await sharp(buffer, { limitInputPixels: 40000000, animated: false }).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  } catch { return NextResponse.json({ error: 'El contenido no es una imagen válida o sus dimensiones son demasiado grandes.' }, { status: 415 }); }
  try {
    const filename = `${randomUUID()}.webp`;
    const directory = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), output, { flag: 'wx' });
    return NextResponse.json({ path: `/uploads/${filename}` }, { status: 201 });
  } catch { return NextResponse.json({ error: 'No se pudo guardar la imagen. Volvé a intentarlo.' }, { status: 500 }); }
}
