import 'dotenv/config.js';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { sql, db };
