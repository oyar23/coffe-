"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { backgroundNames } from "./names";
export const registry = {
  "gradiente-cafe": dynamic(() => import("./GradientBackground"), {
    ssr: false,
  }),
} satisfies Record<(typeof backgroundNames)[number], ComponentType>;
