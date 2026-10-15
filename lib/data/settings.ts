import {z} from 'zod';
import {eq} from 'drizzle-orm';
import {db} from '../db';
import {settings} from '../db/schema';
const themeSchema=z.object({primary:z.string().regex(/^#[0-9a-f]{6}$/i),secondary:z.string().regex(/^#[0-9a-f]{6}$/i),text:z.string().regex(/^#[0-9a-f]{6}$/i),font:z.string().min(1).regex(/^[a-zA-Z0-9 ,"'-]+$/),logo:z.string()});
const backgroundSchema=z.object({type:z.enum(['image','video','lottie','component']),src:z.string(),overlay:z.number().min(0).max(1)});
export type Theme=z.infer<typeof themeSchema>;
export type Background=z.infer<typeof backgroundSchema>;
export const defaultTheme:Theme={primary:'#6f4e37',secondary:'#f5eee6',text:'#30251f',font:'Arial, sans-serif',logo:'/placeholder.svg'};
export const defaultBackground:Background={type:'image',src:'/backgrounds/default.svg',overlay:0.4};
function read<T>(key:string,schema:z.ZodType<T>,fallback:T):T{const row=db.select().from(settings).where(eq(settings.key,key)).get();if(!row)return {...fallback};try{const result=schema.safeParse(JSON.parse(row.value));return result.success?result.data:{...fallback};}catch{return {...fallback};}}
function write(key:string,value:unknown){db.insert(settings).values({key,value:JSON.stringify(value)}).onConflictDoUpdate({target:settings.key,set:{value:JSON.stringify(value)}}).run();}
export function getTheme():Theme{return read('theme',themeSchema,defaultTheme);}
export function setTheme(theme:Theme):Theme{const value=themeSchema.parse(theme);write('theme',value);return value;}
export function getBackground():Background{return read('background',backgroundSchema,defaultBackground);}
export function setBackground(background:Background):Background{const value=backgroundSchema.parse(background);write('background',value);return value;}
