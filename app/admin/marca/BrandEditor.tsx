"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Theme, Background } from "@/lib/data/settings";
import { backgroundNames } from "@/components/background/names";
import { fonts } from "@/components/background/fonts";
import { saveBrand } from "./actions";
import styles from "./marca.module.css";
const presets = [
  {
    name: "Clásico",
    description: "Café, crema y calidez",
    theme: {
      primary: "#6f4e37",
      secondary: "#f5eee6",
      text: "#30251f",
      font: fonts[1],
    },
    background: {
      type: "image",
      src: "/backgrounds/botanico-cafe.webp",
      overlay: 0,
    },
  },
  {
    name: "Otoño",
    description: "Tonos tierra en movimiento",
    theme: {
      primary: "#a34722",
      secondary: "#fff0dc",
      text: "#3c281e",
      font: fonts[3],
    },
    background: { type: "component", src: "gradiente-cafe", overlay: 0.2 },
  },
  {
    name: "Promo especial",
    description: "Una carta con más energía",
    theme: {
      primary: "#6d327d",
      secondary: "#fff1fc",
      text: "#302039",
      font: fonts[2],
    },
    background: { type: "component", src: "gradiente-cafe", overlay: 0.15 },
  },
] as const;
async function videoPoster(file: File) {
  return new Promise<Blob>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(Error("No se pudo leer el video. Probá MP4 H.264."));
    }, 15000);
    video.onerror = () => {
      clearTimeout(timer);
      cleanup();
      reject(Error("No se pudo leer el video."));
    };
    video.onloadedmetadata = () => {
      if (
        Math.max(video.videoWidth, video.videoHeight) > 1280 ||
        Math.min(video.videoWidth, video.videoHeight) > 720
      ) {
        clearTimeout(timer);
        cleanup();
        reject(Error("El video debe ser de hasta 720p."));
      } else video.currentTime = Math.min(0.1, video.duration / 2);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          clearTimeout(timer);
          cleanup();
          blob ? resolve(blob) : reject(Error("No se pudo generar el poster."));
        },
        "image/jpeg",
        0.8,
      );
    };
    video.src = url;
  });
}
export default function BrandEditor({
  initialTheme,
  initialBackground,
}: {
  initialTheme: Theme;
  initialBackground: Background;
}) {
  const [theme, setTheme] = useState(initialTheme);
  const [background, setBackground] = useState(initialBackground);
  const [tab, setTab] = useState("edit");
  const [version, setVersion] = useState(0);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const preview = () =>
    frame.current?.contentWindow?.postMessage(
      { type: "coffe-brand-preview", theme, background },
      location.origin,
    );
  useEffect(() => {
    preview();
  }, [theme, background]);
  useEffect(() => {
    const ready = (event: MessageEvent) => {
      if (
        event.origin === location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === "coffe-brand-ready"
      )
        preview();
    };
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [theme, background]);
  function changeTheme(patch: Partial<Theme>) {
    setTheme((t) => ({ ...t, ...patch }));
    setDirty(true);
    setMessage("");
  }
  function changeBackground(patch: Partial<Background>) {
    setBackground((b) => ({ ...b, ...patch }));
    setDirty(true);
    setMessage("");
  }
  async function upload(file: File | undefined, kind: string) {
    if (!file) return;
    setUploading(true);
    setMessage("Subiendo archivo…");
    try {
      const limit =
        kind === "video"
          ? 3 * 1024 * 1024
          : kind === "lottie"
            ? 300000
            : 5 * 1024 * 1024;
      if (file.size > limit)
        throw Error(
          `El archivo supera el máximo de ${kind === "video" ? "3 MB" : kind === "lottie" ? "300 KB" : "5 MB"}.`,
        );
      const form = new FormData();
      form.set("file", file);
      form.set("kind", kind);
      if (kind === "video")
        form.set("poster", await videoPoster(file), "poster.jpg");
      let response: Response;
      if (kind === "logo") {
        response = await fetch("/api/upload", { method: "POST", body: form });
        if (response.status === 404)
          response = await fetch("/admin/marca/upload", {
            method: "POST",
            body: form,
          });
      } else
        response = await fetch("/admin/marca/upload", {
          method: "POST",
          body: form,
        });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "No se pudo subir.");
      const src = result.src ?? result.path ?? result.url;
      if (typeof src !== "string")
        throw Error("El upload no devolvió una ruta.");
      if (kind === "logo") changeTheme({ logo: src });
      else changeBackground({ src });
      setMessage("Archivo listo. Guardá para publicarlo.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo subir.");
    } finally {
      setUploading(false);
    }
  }
  function save() {
    startTransition(async () => {
      const result = await saveBrand(theme, background);
      setMessage(result.message);
      if (result.ok) {
        setDirty(false);
        setVersion((v) => v + 1);
      }
    });
  }
  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>IDENTIDAD & CAMPAÑAS</p>
          <h1>Tu carta, tu marca.</h1>
          <p>Elegí un estilo, ajustalo y mirá cómo queda.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer">
          Abrir menú ↗
        </a>
      </header>
      <div className={styles.tabs} role="tablist" aria-label="Editor de marca">
        <button
          id="edit-tab"
          type="button"
          role="tab"
          aria-selected={tab === "edit"}
          onClick={() => setTab("edit")}
        >
          Editar
        </button>
        <button
          id="preview-tab"
          type="button"
          role="tab"
          aria-selected={tab === "preview"}
          onClick={() => setTab("preview")}
        >
          Vista previa
        </button>
      </div>
      <div className={styles.layout}>
        <fieldset
          disabled={pending || uploading}
          className={`${styles.editor} ${tab !== "edit" ? styles.mobileHidden : ""}`}
        >
          <details className={styles.section} open>
            <summary>Presets de campaña</summary>
            <p>
              Un punto de partida para cambiar colores, fuente y fondo juntos.
            </p>
            <div className={styles.presets}>
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  disabled={pending || uploading}
                  onClick={() => {
                    setTheme((t) => ({ ...t, ...p.theme }));
                    setBackground({ ...p.background });
                    setDirty(true);
                    setMessage(
                      `${p.name} aplicado a la vista previa. Guardá para publicar.`,
                    );
                  }}
                >
                  <span
                    className={styles.swatch}
                    style={{
                      background: `linear-gradient(135deg,${p.theme.primary} 50%,${p.theme.secondary} 50%)`,
                    }}
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </details>
          <details className={styles.section} open>
            <summary>Tema</summary>
            <div className={styles.colors}>
              {(["primary", "secondary", "text"] as const).map((key, index) => (
                <label key={key}>
                  {["Primario", "Secundario", "Texto"][index]}
                  <span>
                    <input
                      type="color"
                      value={theme[key]}
                      onChange={(e) => changeTheme({ [key]: e.target.value })}
                    />
                    <code>{theme[key]}</code>
                  </span>
                </label>
              ))}
            </div>
            <label>
              Fuente
              <select
                value={theme.font}
                onChange={(e) => changeTheme({ font: e.target.value })}
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>
                    {font.split(",")[0]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Logo · JPG, PNG o WebP
              <input
                disabled={uploading || pending}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  void upload(e.target.files?.[0], "logo");
                  e.target.value = "";
                }}
              />
            </label>
            <small>
              Hasta 5 MB. Podés elegir una foto de la galería o usar la cámara
              desde el selector del celular.
            </small>
            {theme.logo && (
              <div className={styles.logo}>
                <img src={theme.logo} alt="Logo actual" />
                <button type="button" onClick={() => changeTheme({ logo: "" })}>
                  Quitar logo
                </button>
              </div>
            )}
          </details>
          <details className={styles.section} open>
            <summary>Fondo</summary>
            <label>
              Tipo de fondo
              <select
                value={background.type}
                onChange={(e) => {
                  const type = e.target.value as Background["type"];
                  changeBackground({
                    type,
                    src:
                      type === "component"
                        ? "gradiente-cafe"
                        : type === "image"
                          ? "/backgrounds/default.svg"
                          : "",
                  });
                }}
              >
                <option value="image">Imagen fija</option>
                <option value="video">Video</option>
                <option value="lottie">Animación Lottie</option>
                <option value="component">Componente animado</option>
              </select>
            </label>
            {background.type === "component" ? (
              <label>
                Fondo registrado
                <select
                  value={background.src}
                  onChange={(e) => changeBackground({ src: e.target.value })}
                >
                  {backgroundNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                <label>
                  Subir{" "}
                  {background.type === "image"
                    ? "imagen"
                    : background.type === "video"
                      ? "video MP4"
                      : "Lottie JSON"}
                  <input
                    key={background.type}
                    type="file"
                    disabled={uploading || pending}
                    accept={
                      background.type === "image"
                        ? "image/jpeg,image/png,image/webp"
                        : background.type === "video"
                          ? "video/mp4"
                          : ".json,application/json"
                    }
                    onChange={(e) => {
                      void upload(e.target.files?.[0], background.type);
                      e.target.value = "";
                    }}
                  />
                </label>
                <small>
                  {background.type === "video"
                    ? "MP4 H.264, hasta 3 MB y 720p. El poster se genera automáticamente."
                    : background.type === "lottie"
                      ? "JSON vectorial, hasta 300 KB y 60 capas; preferí 30 fps. Sin imágenes ni expresiones."
                      : "JPG, PNG o WebP de hasta 5 MB. Se optimiza al subir."}
                </small>
                <label>
                  Ruta local del archivo
                  <input
                    type="text"
                    value={background.src}
                    placeholder="/backgrounds/archivo"
                    onChange={(e) => changeBackground({ src: e.target.value })}
                  />
                </label>
              </>
            )}
            <label>
              Oscurecer fondo · {Math.round(background.overlay * 100)}%
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={background.overlay}
                onChange={(e) =>
                  changeBackground({ overlay: Number(e.target.value) })
                }
              />
            </label>
            <small>Más overlay mejora la lectura del menú.</small>
          </details>
        </fieldset>
        <section
          className={`${styles.preview} ${tab !== "preview" ? styles.mobileHidden : ""}`}
          aria-label="Vista previa del menú"
        >
          <div className={styles.previewHeading}>
            <strong>Así se ve tu carta</strong>
            <small>
              {dirty ? "Cambios sin publicar" : "Versión publicada"}
            </small>
          </div>
          <iframe
            key={version}
            ref={frame}
            title="Vista previa del menú coffe-a"
            src="/"
            onLoad={preview}
          />
        </section>
      </div>
      <div className={styles.savebar}>
        <p role="status" aria-live="polite">
          {message ||
            (dirty
              ? "Tenés cambios sin guardar."
              : "Los cambios se publican al guardar.")}
        </p>
        <button
          type="button"
          disabled={pending || uploading || !background.src}
          onClick={save}
        >
          {pending ? "Guardando…" : uploading ? "Subiendo…" : "Guardar marca"}
        </button>
      </div>
    </div>
  );
}
