import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createAdminClient } from '../src/lib/supabase/admin';

async function main() {
  const supabase = createAdminClient();
  
  // Test updating Acme Corp brand_aliases in campaigns
  const { data: updateRes, error: updateErr } = await supabase
    .from('campaigns')
    .update({ brand_aliases: ['Acme', 'Acme Inc', 'Acme CRM', 'Acme Analytics', 'acmecorp.com'] })
    .eq('tenant_id', '6be44719-b8a1-4f61-a899-dcce78a31a95')
    .select('id, brand_name, brand_aliases');

  console.log('Update campaign brand_aliases:', { updateRes, updateErr });

  // Test updating tenant settings
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id, name, settings')
    .eq('id', '6be44719-b8a1-4f61-a899-dcce78a31a95')
    .single();

  if (tenantData) {
    const newSettings = {
      ...(tenantData.settings as any || {}),
      aliases: ['Acme', 'Acme Inc', 'Acme CRM', 'Acme Analytics', 'acmecorp.com'],
    };
    const { data: tenantUpdate, error: tErr } = await supabase
      .from('tenants')
      .update({ settings: newSettings })
      .eq('id', '6be44719-b8a1-4f61-a899-dcce78a31a95')
      .select('id, name, settings');
    console.log('Update tenant settings aliases:', { tenantUpdate, tErr });
  }
}

main().catch(console.error);
