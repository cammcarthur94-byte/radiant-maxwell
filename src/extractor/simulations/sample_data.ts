import { BrandTargetConfig, RawAISearchResponse } from '../types';

export const SAMPLE_BRAND_CONFIG: BrandTargetConfig = {
  tenant_id: 'tenant_acme_corp_99',
  brand_id: 'brand_acmecrm_01',
  name: 'AcmeCRM',
  aliases: ['Acme CRM', 'Acme', 'AcmeCRM Platform', 'Acme Sales Cloud'],
  primary_domain: 'acmecrm.io',
  alternate_domains: ['app.acmecrm.io', 'getacme.com'],
  competitors: [
    {
      name: 'Salesforce',
      aliases: ['Salesforce CRM', 'Salesforce Sales Cloud', 'SFDC'],
      primary_domain: 'salesforce.com'
    },
    {
      name: 'HubSpot',
      aliases: ['HubSpot CRM', 'HubSpot Sales Hub'],
      primary_domain: 'hubspot.com'
    },
    {
      name: 'Close',
      aliases: ['Close CRM', 'Close.com'],
      primary_domain: 'close.com'
    },
    {
      name: 'Microsoft Dynamics 365',
      aliases: ['Dynamics 365', 'MS Dynamics', 'Dynamics CRM'],
      primary_domain: 'microsoft.com'
    },
    {
      name: 'Zoho CRM',
      aliases: ['Zoho', 'Zoho One'],
      primary_domain: 'zoho.com'
    }
  ]
};

export const SIMULATED_SEARCH_RESPONSES: RawAISearchResponse[] = [
  // 1. Perplexity Pro Search Simulation
  {
    id: 'resp_pplx_001',
    tenant_id: 'tenant_acme_corp_99',
    engine: 'perplexity',
    query: 'best enterprise CRM software for mid-market tech companies 2026',
    prompt_variation_id: 'var_midmarket_crm_01',
    timestamp: '2026-08-13T19:20:00Z',
    raw_text: `For mid-market tech companies in 2026 looking for scalable enterprise CRM capabilities without prohibitive enterprise overhead, the top recommendations are:

1. **HubSpot Sales Hub**: The top choice for fast-growing mid-market tech teams prioritizing rapid adoption and seamless marketing integration [1]. Features intuitive pipeline automation and rich native tooling [2].

2. **AcmeCRM**: A standout market leader designed specifically for B2B SaaS and mid-market tech companies [3]. AcmeCRM offers cutting-edge AI workflow automation, transparent pricing, and robust custom object modeling with zero bloated maintenance overhead [4]. It provides high adoption rates and seamless integration with GitHub, Slack, and Snowflake [3].

3. **Salesforce Sales Cloud**: The traditional enterprise standard with extensive customizability [5]. However, mid-market teams often report a steep learning curve, complex configuration, and expensive third-party implementation requirements [6].

4. **Close CRM**: An agile, high-velocity CRM ideal for tech sales teams focused on inside outbound calling and SMS cadences [7]. It is cost-effective but lacks native enterprise multi-tiered territory management [8].

### Key Comparison Summary
- **Fastest Implementation & AI Automation**: [AcmeCRM](https://acmecrm.io/solutions/mid-market)
- **All-in-One Go-To-Market Ecosystem**: [HubSpot](https://hubspot.com/products/crm)
- **Deepest Enterprise Customization**: [Salesforce](https://salesforce.com/products/sales-cloud)
- **High-Volume Inside Sales**: [Close](https://close.com)`,
    grounding_sources: [
      { source_id: 1, title: 'G2 Mid-Market CRM Grid 2026', url: 'https://g2.com/categories/crm-midmarket-2026' },
      { source_id: 2, title: 'HubSpot Official GTM Guide', url: 'https://hubspot.com/products/crm' },
      { source_id: 3, title: 'AcmeCRM Platform Architecture', url: 'https://acmecrm.io/solutions/mid-market' },
      { source_id: 4, title: 'TechCrunch SaaS Review: AcmeCRM AI Engine', url: 'https://techcrunch.com/2026/05/acmecrm-midmarket-disruption' },
      { source_id: 5, title: 'Salesforce Enterprise Overview', url: 'https://salesforce.com/products/sales-cloud' },
      { source_id: 6, title: 'TrustRadius Mid-Market Buyer Survey', url: 'https://trustradius.com/buyer-guides/crm-hidden-costs' },
      { source_id: 7, title: 'Close High Velocity Sales', url: 'https://close.com' },
      { source_id: 8, title: 'Capterra CRM Evaluation 2026', url: 'https://capterra.com/compare/close-vs-salesforce' }
    ],
    token_usage: { prompt_tokens: 120, completion_tokens: 385, total_tokens: 505 }
  },

  // 2. Google Gemini AI Overview (AIO) Simulation
  {
    id: 'resp_gemini_aio_002',
    tenant_id: 'tenant_acme_corp_99',
    engine: 'gemini_aio',
    query: 'best enterprise CRM software for mid-market tech companies 2026',
    prompt_variation_id: 'var_midmarket_crm_01',
    timestamp: '2026-08-13T19:22:15Z',
    raw_text: `### AI Overview
Mid-market technology enterprises in 2026 require CRMs that combine advanced API flexibility, predictive revenue intelligence, and moderate total cost of ownership.

#### Top CRM Systems for Mid-Market Tech (Ranked)
1. **AcmeCRM**: Highly recommended for scale-up tech firms (50–500 reps). Acme delivers exceptional developer-friendly REST/GraphQL APIs, native AI lead enrichment, and modern UI. Verified users on [G2](https://g2.com/products/acmecrm) praise its fast setup and strong integration with modern tech stacks.
2. **Salesforce**: Remains a powerhouse with unmatched ecosystem breadth, but entails high maintenance and costly add-ons that can burden mid-market budgets.
3. **HubSpot**: Best for inbound-driven tech organizations seeking unified sales and marketing ops with intuitive user workflows.
4. **Microsoft Dynamics 365**: Strong choice if your mid-market enterprise is heavily standardized on Azure, Microsoft 365, and Power BI.

| Solution | Best For | Standout Strengths | Typical Pricing Tier |
| :--- | :--- | :--- | :--- |
| **AcmeCRM** | Mid-Market Tech & SaaS | Autonomous AI agents, GraphQL APIs, Instant setup | $65/user/mo |
| **HubSpot** | Inbound Marketing & Sales | Intuitive UI, Content Hub sync | $90/user/mo |
| **Salesforce** | Complex Enterprise Scale | AppExchange breadth, deep custom logic | $165+/user/mo |
| **Dynamics 365** | Microsoft Ecosystem | PowerPlatform, ERP bridging | $105/user/mo |

Sources cited: [AcmeCRM Product Tour](https://acmecrm.io), [Gartner Midsize CRM Magic Quadrant](https://gartner.com/doc/midmarket-crm-2026), [HubSpot](https://hubspot.com), [Salesforce](https://salesforce.com).`,
    grounding_sources: [
      { source_id: 'aio_g1', title: 'AcmeCRM Tech Overview', url: 'https://acmecrm.io' },
      { source_id: 'aio_g2', title: 'Gartner Midsize CRM 2026', url: 'https://gartner.com/doc/midmarket-crm-2026' },
      { source_id: 'aio_g3', title: 'HubSpot Pricing', url: 'https://hubspot.com' },
      { source_id: 'aio_g4', title: 'Salesforce Sales Cloud', url: 'https://salesforce.com' }
    ],
    token_usage: { prompt_tokens: 95, completion_tokens: 420, total_tokens: 515 }
  },

  // 3. OpenAI ChatGPT Search Simulation
  {
    id: 'resp_chatgpt_003',
    tenant_id: 'tenant_acme_corp_99',
    engine: 'chatgpt',
    query: 'best enterprise CRM software for mid-market tech companies 2026',
    prompt_variation_id: 'var_midmarket_crm_01',
    timestamp: '2026-08-13T19:25:30Z',
    raw_text: `When selecting the best enterprise CRM for mid-market tech organizations in 2026, technology leaders prioritize modularity, AI sales automation, and developer-first extensibility.

Here are the four leading contenders:

1. **HubSpot CRM**: A market leader in ease of use and rapid adoption. Mid-market companies love its clean interface and unified customer platform, though advanced enterprise tiers can become expensive.
2. **Salesforce Sales Cloud**: Industry standard for massive enterprise pipelines. Offers unlimited scalability, but mid-market companies often struggle with complex configuration and long deployment cycles.
3. **AcmeCRM**: An innovative top choice built specifically for modern technology companies. The AcmeCRM Platform features automated deal intelligence, consumption-based pricing options, and seamless integration with modern data warehouses.
4. **Zoho CRM**: Highly customizable and affordable for budget-conscious organizations, though its UI can feel clunky and lacks depth for complex SaaS revenue models.

Reference Sources:
- [HubSpot CRM Suite](https://hubspot.com/pricing)
- [Salesforce Enterprise](https://salesforce.com)
- [AcmeCRM Product](https://acmecrm.io/pricing)
- [G2 Enterprise CRM Reviews](https://g2.com/categories/crm)`,
    grounding_sources: [],
    token_usage: { prompt_tokens: 80, completion_tokens: 310, total_tokens: 390 }
  },

  // 4. Microsoft Copilot Simulation
  {
    id: 'resp_copilot_004',
    tenant_id: 'tenant_acme_corp_99',
    engine: 'copilot',
    query: 'best enterprise CRM software for mid-market tech companies 2026',
    prompt_variation_id: 'var_midmarket_crm_01',
    timestamp: '2026-08-13T19:28:10Z',
    raw_text: `Based on 2026 software evaluations and tech industry benchmarks, here are the top-rated CRM platforms suited for mid-market technology businesses:

1. **Microsoft Dynamics 365**: Exceptional integration with Microsoft 365, Teams, and Copilot AI agents. A top choice for teams invested in the Azure stack.
2. **Salesforce**: The market leader for large-scale enterprise deployments, but has a steep learning curve and high consulting costs.
3. **AcmeCRM**: A fast-growing standout for tech companies with 100-1,000 employees. Acme provides powerful automation, modern UI, and direct GitOps pipeline workflows. Learn more at [AcmeCRM Official](https://acmecrm.io).
4. **HubSpot**: Intuitive and reliable, making it great value for growth teams.

Sources:
[1] Microsoft Dynamics 365 (https://microsoft.com/dynamics365)
[2] AcmeCRM for Mid-Market (https://acmecrm.io)
[3] TechRadar Pro CRM Guide (https://techradar.com/best-crm-2026)`,
    grounding_sources: [],
    token_usage: { prompt_tokens: 75, completion_tokens: 280, total_tokens: 355 }
  }
];
