const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env.local')));
const connectionString = envConfig.POSTGRES_URL_NON_POOLING || envConfig.POSTGRES_URL;

if (!connectionString) {
  console.error('Error: Database connection string not found');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('Connected to PostgreSQL successfully!');

  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260814000001_multi_competitor_sov.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Applying Migration: 20260814000001_multi_competitor_sov.sql...');
  await client.query(sql);
  console.log('Migration applied successfully!\n');

  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log('Public Schema Tables:');
  tablesRes.rows.forEach(r => console.log(' - ' + r.table_name));

  await client.end();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
