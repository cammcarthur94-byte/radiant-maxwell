import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createAdminClient } from '../src/lib/supabase/admin';

async function checkTables() {
  const supabase = createAdminClient();

  const tablesToCheck = ['campaigns', 'prompts', 'competitors', 'citations', 'scores', 'audit_logs', 'cron_logs', 'geo_recommendations'];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table as any).select('*').limit(1);
    if (error) {
      console.log(`Table [${table}]: ❌ Error - ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`Table [${table}]: ✅ Accessible! Found ${data?.length || 0} sample rows.`);
    }
  }
}

checkTables();
