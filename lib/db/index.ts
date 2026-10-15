import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import * as schema from './schema';
const file=path.resolve(process.env.DATABASE_PATH ?? 'data/menu.db');
mkdirSync(path.dirname(file),{recursive:true});
const globalDb=globalThis as unknown as {menuSqlite?:Database.Database;menuFile?:string};
export const sqlite=globalDb.menuSqlite && globalDb.menuFile===file ? globalDb.menuSqlite : new Database(file);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('busy_timeout = 5000');
if(process.env.NODE_ENV!=='production'){globalDb.menuSqlite=sqlite;globalDb.menuFile=file;}
export const db=drizzle(sqlite,{schema});
