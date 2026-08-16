# Radiant Maxwell - Pricing Model & Cost Architecture Specification

## 1. Overview & Financial Summary

Radiant Maxwell is a multi-tenant AI Visibility and Generative Engine Optimization (GEO) platform. The financial model is designed to support high-margin unit economics while guaranteeing scalable multi-engine LLM tracking across ChatGPT, Gemini, Perplexity, Claude, and Copilot.

This document establishes the official cost breakdown, margin structure, and technical guardrails enforcing profitability across all subscription tiers.

---

## 2. Infrastructure & Operational Cost Breakdown

### 2.1. Fixed Infrastructure Overhead ($75 / month baseline per environment)

Every production deployment environment incurs a baseline operational overhead of **$75.00 / month**:

| Service Component | Monthly Cost | Functional Allocation & Scope |
| :--- | :--- | :--- |
| **Vercel Pro** | $20.00 / mo | Production hosting, Edge Middleware, Edge Functions, automated cron triggers for scheduled crawler runs, global CDN asset delivery. |
| **Supabase Pro** | $25.00 / mo | Managed PostgreSQL database, Supavisor connection pooling, Row-Level Security (RLS) enforcement, Auth service, Edge Functions, daily automated backups. |
| **Development & Monitoring** | $30.00 / mo | Production domain routing & DNS, Sentry error tracking / telemetry, GitHub team CI/CD pipelines, SSL certificate lifecycle management. |
| **Total Baseline Fixed Overhead** | **$75.00 / mo** | **Fully absorbed baseline across active tenant customer accounts.** |

---

### 2.2. Variable LLM Model Inference Costs

Variable costs scale directly with the number of brand campaigns, monitored prompt keywords, tracked AI search models, and execution frequencies.

* **Blended Cost per Query:** **$0.015 / query**
  * Accounts for input prompt tokens, multi-turn reasoning, web-grounded citations extraction, and JSON structured output parsing across supported engines (e.g., GPT-4o / GPT-4o-mini, Gemini 1.5 Flash / Pro, Claude 3.5 Sonnet / Haiku, Perplexity Sonar).
* **Execution Frequency:** Scheduled weekly runs (**4 batch tracking runs per month**).

#### Calculation Formula
$$\text{Monthly Variable Cost} = \text{Tracked Prompts} \times \text{Active Models} \times \text{Runs per Month (4)} \times \$0.015$$

---

## 3. Tiered Pricing & Gross Margin Structure

### 3.1. Tier Specifications & Financial Modeling

| Metric / Dimension | Starter Tier | Growth Tier | Agency Pro Tier |
| :--- | :--- | :--- | :--- |
| **Monthly Subscription Price** | **$79.00 / mo** | **$199.00 / mo** | **$499.00 / mo** |
| **Annual Billing (20% Discount)** | **$63.00 / mo** ($756 / yr) | **$159.00 / mo** ($1,908 / yr) | **$399.00 / mo** ($4,788 / yr) |
| **Brand Campaigns** | **1 Campaign** | **5 Campaigns** | **20 Campaigns** |
| **Monitored Prompts Quota** | **50 Prompts** | **250 Prompts** | **1,000 Prompts** |
| **Tracked LLM Engines** | **4 Models** *(Gemini Flash, GPT-4o-mini, Sonar, Haiku)* | **6 Models** *(Adds GPT-4o, Claude Sonnet)* | **6 Models** *(Full Suite + Custom Fine-Tuning)* |
| **Crawling Schedule** | Weekly (4x / month) | Weekly (4x / month) | Priority Weekly + On-Demand Triggers |
| **Total Queries per Month** | 50 × 4 × 4 = **800 queries** | 250 × 6 × 4 = **6,000 queries** | 1,000 × 6 × 4 = **24,000 queries** |
| **Variable LLM Cost ($0.015/query)**| **$12.00 / mo** | **$90.00 / mo** | **$360.00 / mo** |
| **Allocated Fixed Overhead** | **$15.00 / mo** | **$25.00 / mo** | **$35.00 / mo** |
| **Total Estimated Cost** | **$27.00 / mo** | **$115.00 / mo** | **$395.00 / mo** |
| **Gross Margin ($ / tenant)** | **+$52.00 / mo** | **+$84.00 / mo** | **+$104.00 / mo** |
| **Gross Margin Percentage** | **65.8% Margin** | **42.2% Margin** | **20.8% Margin** |

> [!NOTE]
> The allocated fixed overhead across one unit of each tier equals $\$15 + \$25 + \$35 = \$75/\text{month}$, fully covering the $75 baseline infrastructure commitment. As customer account density scales, fixed overhead per tenant approaches zero, expanding gross margins toward **84.8%** (Starter), **54.8%** (Growth), and **27.9%** (Agency Pro).

---

## 4. Architectural Enforcement & Backend Guardrails

To protect the projected profit margins against unexpected consumption spikes or multi-model query abuse, the platform enforces technical guardrails at three layers:

```mermaid
flowchart TD
    A[Tenant Request / Cron Trigger] --> B[Vercel Edge Guardrails]
    B -->|Check Campaign & Prompt Limit| C{Quota Exceeded?}
    C -->|Yes| D[HTTP 402 / 403 Tier Limit Reached]
    C -->|No| E[Supavisor Pooled Connection]
    E --> F[Supabase RLS Policy Check]
    F --> G[Multi-Model Batch Runner]
    G -->|Rate-Limited Inference Calls| H[LLM Providers ($0.015/query)]
    H --> I[Insert Normalized Citations & SOV]
```

### 4.1. Server-Side Guardrail Rules
1. **Campaign Creation Limits:**
   - Enforced by `canAddCampaign` in `src/lib/subscription-limits.ts`.
   - Starter tenants are restricted to `1` campaign; Growth to `5`; Agency Pro to `20`.
2. **Monitored Prompts Quota:**
   - Enforced by `validatePromptLimit` before scheduling LLM extraction batches.
   - Restricts total active prompt tracking to `50` (Starter), `250` (Growth), and `1,000` (Agency Pro).
3. **Database Connection Pooling (Supavisor):**
   - Vercel background cron jobs execute asynchronous worker pools connected via Supavisor port `6543` (transaction mode) to prevent thread exhaustion during 24,000-query batch windows.
4. **Stripe Webhook Synchronization:**
   - Handled via `src/app/api/stripe/webhook/route.ts` with signature verification.
   - Instantly updates `tenants.subscription_tier` upon checkout completion, plan upgrades, or cancellations.

---

## 5. Summary Table for Billing & Stripe Integrations

| Tier Code | Display Name | Stripe Price ID (Monthly) | Stripe Price ID (Annual) | Monthly Cost Basis | Unit Margin |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `starter` | Starter | `price_starter_79_monthly` | `price_starter_63_annual` | $27.00 | +$52.00 (65.8%) |
| `growth` | Growth | `price_growth_199_monthly` | `price_growth_159_annual` | $115.00 | +$84.00 (42.2%) |
| `enterprise` / `agency` | Agency Pro | `price_agency_499_monthly` | `price_agency_399_annual` | $395.00 | +$104.00 (20.8%) |
