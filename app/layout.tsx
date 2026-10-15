import type {CSSProperties,ReactNode} from 'react';
import {getTheme} from '@/lib/data/settings';
import './globals.css';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const metadata={title:'coffe-a',description:'Menú digital de coffe-a'};
export default function RootLayout({children}:{children:ReactNode}){const t=getTheme();const style={'--color-primary':t.primary,'--color-secondary':t.secondary,'--color-text':t.text,'--font-main':t.font} as CSSProperties;return <html lang="es"><body style={style}>{children}</body></html>;}
