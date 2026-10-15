import styles from './menu.module.css';
export type PromoBadgeProps = { label: string };
export default function PromoBadge({ label }: PromoBadgeProps) {
  return <span className={styles.promoBadge}>{label}</span>;
}
