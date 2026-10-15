"use client";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Image from 'next/image';
import { hasPhoto, localImage } from './types';
import styles from './admin.module.css';

export default function ImageUpload({ value, onChange, onBusyChange, disabled }: { value: string; onChange: (path: string) => void; onBusyChange: (busy: boolean) => void; disabled: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { request.current?.abort(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  async function upload(file?: File) {
    if (!file || busy || disabled) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Elegí una imagen JPG, PNG o WebP.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('La imagen debe pesar hasta 5 MB.'); return; }
    if (!file.size) { setError('El archivo está vacío.'); return; }
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setPreview(URL.createObjectURL(file)); setBusy(true); onBusyChange(true);
    try {
      const form = new FormData(); form.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: form, signal: controller.signal });
      const result = await response.json();
      if (!response.ok || typeof result.path !== 'string') throw new Error(result.error || 'No se pudo subir la imagen.');
      onChange(result.path); setPreview(null);
    } catch (failure) {
      if (!controller.signal.aborted) { setError(failure instanceof Error ? failure.message : 'No se pudo subir la imagen.'); setPreview(null); }
    } finally { setBusy(false); onBusyChange(false); if (fileInput.current) fileInput.current.value = ''; }
  }
  const src = preview || (hasPhoto(value) ? localImage(value) : null);
  return <div className={styles.upload}>
    <div className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`} onDragOver={(event: DragEvent) => { event.preventDefault(); if (!disabled && !busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event: DragEvent) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files[0]); }}>
      {src && <Image src={src} alt="Vista previa de la foto del producto" width={320} height={200} unoptimized className={styles.uploadPreview} />}
      <label className={styles.uploadLabel}><span className={styles.uploadIcon} aria-hidden="true">{busy ? '…' : '↥'}</span><strong>{busy ? 'Subiendo foto…' : src ? 'Cambiar foto' : 'Arrastrá una foto o elegí un archivo'}</strong><span>JPG, PNG o WebP · hasta 5 MB</span><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || busy} onChange={(event: ChangeEvent<HTMLInputElement>) => void upload(event.target.files?.[0])} className={styles.fileInput} /></label>
    </div>
    {hasPhoto(value) && <button className={styles.textButton} type="button" disabled={disabled || busy} onClick={() => { onChange('/placeholder.svg'); setPreview(null); setError(''); }}>Quitar foto de este producto</button>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    <p className={styles.help}>La foto es opcional. Podés cargarla más adelante.</p>
  </div>;
}
