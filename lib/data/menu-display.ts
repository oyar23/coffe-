import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { settings } from '../db/schema';

const schema = z.object({ showProductImages: z.boolean() });
export type MenuDisplay = z.infer<typeof schema>;
export const defaultMenuDisplay: MenuDisplay = { showProductImages: false };

export function getMenuDisplay(): MenuDisplay {
  const row = db.select().from(settings).where(eq(settings.key, 'menu_display')).get();
  if (!row) return { ...defaultMenuDisplay };
  try { return schema.parse(JSON.parse(row.value)); }
  catch { return { ...defaultMenuDisplay }; }
}

export function setMenuDisplay(input: MenuDisplay): MenuDisplay {
  const value = schema.parse(input);
  const json = JSON.stringify(value);
  db.insert(settings).values({ key: 'menu_display', value: json }).onConflictDoUpdate({ target: settings.key, set: { value: json } }).run();
  return value;
}
