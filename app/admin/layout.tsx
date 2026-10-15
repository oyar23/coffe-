import Link from 'next/link';
import type {ReactNode} from 'react';
export default function AdminLayout({children}:{children:ReactNode}){return <div className="admin-shell"><nav aria-label="Administración" className="admin-nav"><Link href="/admin">Productos</Link><Link href="/admin/productos/nuevo">Nuevo producto</Link><Link href="/admin/marca">Marca</Link></nav><main className="admin-content">{children}</main></div>;}
