"use client";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { validateLottie } from "./validateLottie";
import { useMotion } from "./useMotion";
import styles from "./background.module.css";
export default function LottieBackground({ src }: { src: string }) {
  const [data, setData] = useState<object | null>(null);
  const motion = useMotion();
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    fetch(src, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw Error();
        const text = await r.text();
        if (text.length > 300000) throw Error();
        const json = JSON.parse(text);
        validateLottie(json);
        setData(json);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [src]);
  return data ? (
    <Lottie
      key={`${src}-${motion}`}
      animationData={data}
      autoplay={motion}
      loop={motion}
      className={styles.media}
      rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
    />
  ) : null;
}
