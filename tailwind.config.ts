import type { Config } from 'tailwindcss';
export default {content:['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],theme:{extend:{colors:{primary:'var(--color-primary)',secondary:'var(--color-secondary)',text:'var(--color-text)'},fontFamily:{main:['var(--font-main)']}}},plugins:[]} satisfies Config;
