import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

/**
 * Supavisor Connection Pooling Guardrail
 * Connects to Supabase via Supavisor pooler (port 6543 / transaction mode)
 * or pooled direct connection string to avoid exhausting PostgreSQL client slots.
 */
export function getDbPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString =
    process.env.DATABASE_POOL_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  const poolConfig: PoolConfig = {
    connectionString: connectionString && !connectionString.includes('[SENSITIVE]')
      ? connectionString
      : undefined,
    host: process.env.POSTGRES_HOST || 'db.wmbufomqafcxnsglrrvz.supabase.co',
    port: parseInt(process.env.POSTGRES_PORT || '6543', 10), // Supavisor default port 6543
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD && !process.env.POSTGRES_PASSWORD.includes('[SENSITIVE]')
      ? process.env.POSTGRES_PASSWORD
      : undefined,
    database: process.env.POSTGRES_DATABASE || 'postgres',
    ssl: {
      rejectUnauthorized: false,
    },
    // Supavisor guardrail settings for serverless functions
    max: 10, // Max clients in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };

  pool = new Pool(poolConfig);

  pool.on('error', (err) => {
    console.error('Unexpected error on idle Supavisor client:', err);
  });

  return pool;
}

/**
 * Helper to run pooled queries with automatic client release
 */
export async function queryPooled<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getDbPool();
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
