"use client";

import { useMotion } from './useMotion';
import styles from './background.module.css';

export default function ImageBackground({ src }: { src: string }) {
  const motion = useMotion();
  const botanical = src === '/backgrounds/botanico-cafe.webp';
  return (
    <div
      className={`${styles.cover} ${styles.animatedImage}`}
      style={{
        backgroundImage: botanical ? undefined : `url(${JSON.stringify(src)})`,
        animationPlayState: motion ? 'running' : 'paused',
      }}
    >
      {botanical && <div className={styles.botanicalArt} style={{ backgroundImage: `url(${JSON.stringify(src)})` }} />}
    </div>
  );
}
