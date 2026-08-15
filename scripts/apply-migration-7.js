const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env.local')));
const connectionString = envConfig.POSTGRES_URL_NON_POOLING || envConfig.POSTGRES_URL;

if (!connectionString) {
  console.error('Error: Database connection string not found in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('Connecting to PostgreSQL database...');
  await client.connect();
  console.log('Connected to PostgreSQL successfully!');

  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260814000007_brand_aliases_management.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Applying Migration: 20260814000007_brand_aliases_management.sql...');
  await client.query(sql);
  console.log('Migration applied successfully!\n');

  // Verify column existence
  const columnsRes = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name IN ('campaigns', 'tenants') 
      AND column_name IN ('aliases', 'brand_aliases')
    ORDER BY table_name, column_name;
  `);

  console.log('Verified Database Columns:');
  columnsRes.rows.forEach(r => console.log(` - ${r.table_name}.${r.column_name} (${r.data_type})`));

  await client.end();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
