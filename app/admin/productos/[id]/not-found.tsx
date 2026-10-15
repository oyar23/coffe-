import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import styles from '@/components/admin/admin.module.css';
export default function ProductNotFound() { return <AdminShell><div className={styles.empty}><h1>Este producto no está en la carta.</h1><p>Puede haberse eliminado. Volvé al listado para continuar.</p><Link href="/admin" className={styles.primaryButton}>Volver a productos</Link></div></AdminShell>; }
