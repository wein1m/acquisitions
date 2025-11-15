import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// initialize neonSQL
const sql = neon(process.env.DATABASE_URL);
// initialize drizzleDB
const db = drizzle(sql);

export { db, sql };
