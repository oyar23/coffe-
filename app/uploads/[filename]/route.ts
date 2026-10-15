import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const filenamePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif|gif)$/i;
const mime: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif' };
// Next enumera public/ al arrancar en producción: esta ruta sirve subidas nuevas sin reiniciar.
export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!filenamePattern.test(filename)) return new NextResponse(null, { status: 404 });
  try {
    const bytes = await readFile(path.join(process.cwd(), 'public', 'uploads', filename));
    return new NextResponse(new Uint8Array(bytes), { headers: { 'Content-Type': mime[path.extname(filename).slice(1).toLowerCase()], 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) {
    const status = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 404 : 500;
    return new NextResponse(null, { status });
  }
}
