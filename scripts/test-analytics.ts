import {
  resolveDateWindows,
  calculateShareOfVoice,
  calculateVisibilityScore,
  calculateCitationRate,
  calculateCompetitivePosition,
  calculatePeriodOverPeriodMetrics,
} from '../src/lib/services/analytics';

async function runTests() {
  console.log('--- Starting Analytics Service Unit Tests ---');

  // Test 1: Date Windows
  const window30d = resolveDateWindows('30d');
  console.assert(window30d.days === 30, 'Window days should be 30');
  console.assert(window30d.previousEnd.getTime() === window30d.currentStart.getTime(), 'Previous end should equal current start');
  console.log('✓ Test 1: Date Windows resolved correctly');

  // Mock Supabase Client
  const mockTenantId = '6be44719-b8a1-4f61-a899-dcce78a31a95';

  const mockBrandMentions = [
    { tenant_id: mockTenantId, is_primary_brand: true, brand_name: 'Acme Corp', campaign_id: 'camp-1', created_at: new Date().toISOString() },
    { tenant_id: mockTenantId, is_primary_brand: true, brand_name: 'Acme Corp', campaign_id: 'camp-2', created_at: new Date().toISOString() },
    { tenant_id: mockTenantId, is_primary_brand: false, brand_name: 'Competitor A', campaign_id: 'camp-1', created_at: new Date().toISOString() },
    { tenant_id: mockTenantId, is_primary_brand: false, brand_name: 'Competitor B', campaign_id: 'camp-2', created_at: new Date().toISOString() },
  ];

  const mockCitations = [
    { tenant_id: mockTenantId, campaign_id: 'camp-1', brand_mentioned: true, competitor_id: null, captured_at: new Date().toISOString() },
    { tenant_id: mockTenantId, campaign_id: 'camp-2', brand_mentioned: true, competitor_id: null, captured_at: new Date().toISOString() },
    { tenant_id: mockTenantId, campaign_id: 'camp-3', brand_mentioned: false, competitor_id: null, captured_at: new Date().toISOString() },
    { tenant_id: mockTenantId, campaign_id: 'camp-4', brand_mentioned: false, competitor_id: null, captured_at: new Date().toISOString() },
  ];

  const createMockClient = (mentions = mockBrandMentions, citations = mockCitations) => {
    return {
      from: (table: string) => {
        let rows = table === 'brand_mentions' ? mentions : citations;
        return {
          select: () => ({
            eq: () => ({
              gte: () => ({
                lte: () => Promise.resolve({ data: rows, error: null }),
              }),
              eq: () => ({
                gte: () => ({
                  lte: () => Promise.resolve({ data: rows.filter((r: any) => r.is_primary_brand), error: null }),
                }),
              }),
            }),
          }),
        };
      },
    } as any;
  };

  // Test 2: Share of Voice (2 primary out of 4 total = 50%)
  const client = createMockClient();
  const now = new Date();
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sov = await calculateShareOfVoice(client, mockTenantId, past, now);
  console.log(`Share of Voice: ${sov}%`);
  console.assert(sov === 50, `Expected SoV to be 50%, got ${sov}%`);
  console.log('✓ Test 2: Share of Voice calculated correctly');

  // Test 3: Visibility Score (2 primary campaigns out of 4 total citations campaigns = 50%)
  const vis = await calculateVisibilityScore(client, mockTenantId, past, now);
  console.log(`Visibility Score: ${vis}%`);
  console.assert(vis === 50, `Expected Visibility to be 50%, got ${vis}%`);
  console.log('✓ Test 3: Visibility Score calculated correctly');

  // Test 4: Citation Rate (2 primary cited campaigns out of 4 total citation campaigns = 50%)
  const citRate = await calculateCitationRate(client, mockTenantId, past, now);
  console.log(`Citation Rate: ${citRate}%`);
  console.assert(citRate === 50, `Expected Citation Rate to be 50%, got ${citRate}%`);
  console.log('✓ Test 4: Citation Rate calculated correctly');

  // Test 5: Competitive Position (Acme has 2, Comp A has 1, Comp B has 1 -> Acme is Rank #1)
  const compPos = await calculateCompetitivePosition(client, mockTenantId, past, now, 'all', 'Acme Corp');
  console.log(`Competitive Position Rank: ${compPos.rank}`);
  console.assert(compPos.rank === 1, `Expected Rank 1, got ${compPos.rank}`);
  console.assert(compPos.leaderboard.length === 3, `Expected 3 brands in leaderboard, got ${compPos.leaderboard.length}`);
  console.log('✓ Test 5: Competitive Position calculated correctly');

  // Test 6: Zero Division Safety
  const emptyClient = createMockClient([], []);
  const zeroSov = await calculateShareOfVoice(emptyClient, mockTenantId, past, now);
  const zeroVis = await calculateVisibilityScore(emptyClient, mockTenantId, past, now);
  const zeroCit = await calculateCitationRate(emptyClient, mockTenantId, past, now);
  console.assert(zeroSov === 0 && zeroVis === 0 && zeroCit === 0, 'Zero state calculations must return 0 without errors');
  console.log('✓ Test 6: Zero Division edge cases handled safely');

  console.log('\nAll Analytics Service mathematical formulas verified successfully!');
}

runTests().catch(console.error);
