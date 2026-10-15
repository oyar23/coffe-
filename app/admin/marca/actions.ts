"use server";
import { revalidatePath } from "next/cache";
import {
  setTheme,
  setBackground,
  type Theme,
  type Background,
} from "@/lib/data/settings";
import { backgroundNames } from "@/components/background/names";
import { fonts } from "@/components/background/fonts";
const local = (value: string) =>
  value === "" ||
  (/^\/(?!\/)[a-zA-Z0-9_./-]+$/.test(value) && !value.includes(".."));
export async function saveBrand(theme: Theme, background: Background) {
  try {
    if (!fonts.includes(theme.font) || !local(theme.logo))
      throw Error("Fuente o logo inválido.");
    if (
      !["image", "video", "lottie", "component"].includes(background.type) ||
      !Number.isFinite(background.overlay) ||
      background.overlay < 0 ||
      background.overlay > 1
    )
      throw Error("Fondo inválido.");
    if (
      background.type === "component"
        ? !backgroundNames.some((name) => name === background.src)
        : !local(background.src) || !background.src
    )
      throw Error("Elegí un fondo válido.");
    if (
      ![theme.primary, theme.secondary, theme.text].every((c) =>
        /^#[0-9a-f]{6}$/i.test(c),
      )
    )
      throw Error("Colores inválidos.");
    setTheme(theme);
    setBackground(background);
    revalidatePath("/");
    revalidatePath("/admin/marca");
    return {
      ok: true,
      message: "Marca guardada. El menú ya está actualizado.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo guardar. Intentá de nuevo.",
    };
  }
}
