const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env.local')));
const connectionString = envConfig.POSTGRES_URL_NON_POOLING || envConfig.POSTGRES_URL;

if (!connectionString) {
  console.error('Error: POSTGRES_URL or POSTGRES_URL_NON_POOLING not found in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('Connected to Supabase PostgreSQL successfully!');

  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260814000000_phase1_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Applying Phase 1 Schema (Tenants, Tenant Members, Campaigns, Citations, Citation Links + RLS)...');
  await client.query(sql);
  console.log('Migration applied successfully!\n');

  // Verify created tables
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Created Tables in public schema:');
  tablesRes.rows.forEach(r => console.log(' - ' + r.table_name));

  // Verify RLS policies
  const rlsRes = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);
  console.log('\nRow Level Security (RLS) Status:');
  rlsRes.rows.forEach(r => console.log(` - ${r.tablename}: RLS active = ${r.rowsecurity}`));

  // Verify specific policies
  const policiesRes = await client.query(`
    SELECT policyname, tablename, permissive, roles, cmd, qual 
    FROM pg_policies 
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `);
  console.log(`\nActive RLS Policies Count: ${policiesRes.rows.length}`);
  policiesRes.rows.forEach(p => console.log(` - [${p.tablename}] "${p.policyname}" (${p.cmd})`));

  await client.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
