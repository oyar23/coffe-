"use client";

import { useMotion } from './useMotion';
import styles from './background.module.css';

export default function ImageBackground({ src }: { src: string }) {
  const motion = useMotion();
  return (
    <div
      className={`${styles.cover} ${styles.animatedImage}`}
      style={{
        backgroundImage: `url(${JSON.stringify(src)})`,
        animationPlayState: motion ? 'running' : 'paused',
      }}
    />
  );
}
