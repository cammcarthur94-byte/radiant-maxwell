import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createAdminClient } from '../src/lib/supabase/admin';

async function main() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('campaigns').select('*').limit(3);
  console.log('Campaigns query:', { data, error });

  const { data: tenants, error: tenantErr } = await supabase.from('tenants').select('*').limit(3);
  console.log('Tenants query:', { tenants, tenantErr });
}

main().catch(console.error);
