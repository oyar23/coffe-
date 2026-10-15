"use client";
import { useMotion } from "./useMotion";
import styles from "./background.module.css";
export default function VideoBackground({ src }: { src: string }) {
  const motion = useMotion();
  const poster = `${src}.poster.jpg`;
  return (
    <>
      <div
        className={styles.cover}
        style={{
          backgroundImage: `url(${JSON.stringify(poster)}),url('/backgrounds/default.svg')`,
        }}
      />
      {motion && (
        <video
          className={styles.media}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
    </>
  );
}
