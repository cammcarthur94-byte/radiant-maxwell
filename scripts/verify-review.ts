import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createAdminClient } from '../src/lib/supabase/admin';

async function main() {
  const supabase = createAdminClient();

  // 1. Does citations table have the new columns?
  const { data: cols } = await supabase
    .from('citations')
    .select('id, raw_ai_response, sentiment_label, is_misinformation, domain_name, user_prompt')
    .limit(2);
  console.log('citations new cols query ok:', !!cols, cols?.length);

  // 2. Check a real citation row for the fields the UI expects
  const { data: one } = await supabase.from('citations').select('*').limit(1);
  if (one && one[0]) {
    const c = one[0];
    console.log('sample citation:');
    console.log('  id:', c.id);
    console.log('  raw_response_text:', JSON.stringify((c as any).raw_response_text));
    console.log('  raw_ai_response:', JSON.stringify((c as any).raw_ai_response));
    console.log('  sentiment_label:', JSON.stringify((c as any).sentiment_label));
    console.log('  is_misinformation:', JSON.stringify((c as any).is_misinformation));
    console.log('  mention_sentiment:', JSON.stringify((c as any).mention_sentiment));
    console.log('  domain_name:', JSON.stringify((c as any).domain_name));
    console.log('  extracted_metrics keys:', Object.keys((c as any).extracted_metrics || {}));

    // 3. Test flag persistence on a real citation (then revert)
    const id = c.id;
    const { data: flagData, error: flagErr } = await supabase
      .from('citations')
      .update({ is_misinformation: true, sentiment_label: 'Inaccurate' })
      .eq('id', id)
      .select()
      .single();
    console.log('flag update:', flagErr ? `ERR ${flagErr.message}` : 'ok');
    // revert
    const { error: revertErr } = await supabase
      .from('citations')
      .update({ is_misinformation: false, sentiment_label: 'Positive' })
      .eq('id', id);
    console.log('flag revert:', revertErr ? `ERR ${revertErr.message}` : 'ok');
  }

  // 4. tenants + campaigns aliases columns
  const { data: ten } = await supabase.from('tenants').select('id, aliases, settings').limit(1);
  console.log('tenant aliases col ok:', !!ten);
  const { data: camp } = await supabase.from('campaigns').select('id, aliases, brand_aliases').limit(2);
  console.log('campaign aliases col ok:', !!camp, camp?.map((x: any) => ({ aliases: x.aliases, brand_aliases: x.brand_aliases })));

  // 5. Duplicate campaigns? count per tenant
  const { data: camps } = await supabase.from('campaigns').select('tenant_id, name, is_active');
  const byTenant: Record<string, number> = {};
  (camps || []).forEach((c: any) => {
    byTenant[c.tenant_id] = (byTenant[c.tenant_id] || 0) + 1;
  });
  console.log('campaign counts per tenant:', byTenant);
}

main().catch((e) => { console.error(e); process.exit(1); });

async function second() {
  const supabase = createAdminClient();
  const { data: p } = await supabase.from('prompts').select('prompt_key').limit(3);
  console.log('prompts table:', p ? 'EXISTS' : 'MISSING/ERR', JSON.stringify(p));
  const { data: cl, error: cle } = await supabase.from('cron_logs').select('id').limit(1);
  console.log('cron_logs:', cle ? `ERR ${cle.message}` : 'EXISTS', JSON.stringify(cl));
  const { data: t } = await supabase.from('tenants').select('id, name, settings').limit(2);
  console.log('tenants sample:', JSON.stringify(t));
  const { data: camps } = await supabase.from('campaigns').select('id, name, brand_name, target_domain, target_queries, competitors, is_active').eq('tenant_id', '91ef5502-9e60-42e1-9c16-54492a6c4344');
  console.log('tenant 91ef campaigns:', camps?.length, camps?.slice(0,4).map((c:any)=>({name:c.name, queries:c.target_queries, active:c.is_active})));
}
second();
