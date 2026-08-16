import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!connectionString) {
    console.error('❌ POSTGRES_URL environment variable is missing.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL database.');

    const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/20260816000000_core_relational_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⚡ Executing migration 20260816000000_core_relational_schema.sql...');
    await client.query(sql);
    console.log('✅ Migration executed successfully!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('campaigns', 'prompts', 'scores', 'competitors', 'audit_logs')
      ORDER BY table_name;
    `);

    console.log('\nVerified tables in Supabase:');
    res.rows.forEach((r) => console.log(` - ${r.table_name}`));

    // Verify row count in scores
    const scoreCount = await client.query('SELECT COUNT(*) FROM public.scores');
    console.log(`\nScores table row count: ${scoreCount.rows[0].count}`);

    // Verify row count in prompts
    const promptCount = await client.query('SELECT COUNT(*) FROM public.prompts');
    console.log(`Prompts table row count: ${promptCount.rows[0].count}`);

    // Verify row count in audit_logs
    const auditCount = await client.query('SELECT COUNT(*) FROM public.audit_logs');
    console.log(`Audit logs table row count: ${auditCount.rows[0].count}`);

  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
