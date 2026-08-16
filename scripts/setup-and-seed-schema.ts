import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createAdminClient } from '../src/lib/supabase/admin';

async function testSupabaseTables() {
  const supabase = createAdminClient();
  console.log('✅ Connected with Supabase Admin Client.');

  // Check campaigns
  const { data: campaigns, error: campErr } = await supabase.from('campaigns').select('*');
  if (campErr) {
    console.error('Campaigns error:', campErr.message);
  } else {
    console.log(`Found ${campaigns?.length || 0} campaigns:`, campaigns?.map((c) => c.brand_name));
  }

  // Check citations
  const { count: citationCount } = await supabase.from('citations').select('*', { count: 'exact', head: true });
  console.log(`Total citations: ${citationCount}`);

  // Check tenants
  const { data: tenants } = await supabase.from('tenants').select('*');
  console.log(`Found ${tenants?.length || 0} tenants:`, tenants?.map((t) => t.name));
}

testSupabaseTables();
