import type {CSSProperties,ReactNode} from 'react';
import snapshot from '@/lib/demo/menu.json';
import './globals.css';
export const runtime='nodejs';
export const metadata={title:'coffe-a',description:'Menú digital de coffe-a'};
export default function RootLayout({children}:{children:ReactNode}){const t=snapshot.theme;const style={'--color-primary':t.primary,'--color-secondary':t.secondary,'--color-text':t.text,'--font-main':t.font} as CSSProperties;return <html lang="es"><body style={style}>{children}</body></html>;}
