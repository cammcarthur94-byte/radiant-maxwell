import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testPg() {
  const host = process.env.POSTGRES_HOST || 'db.wmbufomqafcxnsglrrvz.supabase.co';
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE || 'postgres';

  console.log(`Connecting to ${host} as ${user}...`);

  // Direct connection
  const client = new Client({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.wmbufomqafcxnsglrrvz',
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to Supabase pooler!');
    const res = await client.query('SELECT current_database(), version()');
    console.log('Database version:', res.rows[0]);
    await client.end();
  } catch (err: any) {
    console.error('❌ Connection error:', err.message);
  }
}

testPg();
