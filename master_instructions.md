# Master Instructions: Visibility Analytics Platform

## Project Context

We are building a multi-tenant SaaS application designed to track brand citations, share of voice, and AI Overview Optimization (AIO) visibility across conversational AI platforms (ChatGPT, Perplexity, Gemini, and Copilot). 

## Technical Stack

* Backend & Hosting: Vercel (utilizing serverless functions and cron jobs for the core tracking loop).
* Database: Supabase (PostgreSQL).

## Development Directives

1. Natural Language Execution: I will be guiding the architecture and feature development entirely through natural language. I rely on you to plan, write, validate, and execute all code autonomously without expecting me to write or edit syntax.

2. Artifact Verification: Before applying complex backend logic or deploying Vercel functions, output an Artifact (markdown file or JSON) summarizing your architectural decisions or demonstrating the data extraction logic.

3. Phased Deployment: Phase 1 is strictly a standalone citation tracker for standard businesses. Do not build integrations for external platforms until Phase 1 is complete and verified.

4. Commercial Readiness: The intention is to commercially sell this software. The database architecture must support multi-tenancy from day one. Every database query must filter by a tenant identifier, and Supabase Row Level Security (RLS) policies must be active to isolate user data.

5. Database Pooling: When building the Vercel cron jobs that query the LLMs, you MUST configure Supabase connection pooling using Supavisor to prevent the background tracking loops from exhausting database connections.

6. AIO Priority: The schema must include dedicated tables for tracking specific AIO citation links, prompt variations, and share-of-voice scoring metrics.

7. Commercial Pricing & Cost Architecture:
   - Baseline Fixed Infrastructure: $75/month per environment (Vercel Pro $20, Supabase Pro $25, Dev & Monitoring $30).
   - Variable Inference Cost: $0.015 per query across multi-model inference calls (weekly batch execution / 4 runs per month).
   - Monetization Tiers:
     * Starter ($79/mo, $63/mo annual): 1 Brand Campaign, 50 Prompts, 4 Models (Variable: $12, Fixed: $15 -> Estimated Cost: $27/mo, Margin: 65.8%).
     * Growth ($199/mo, $159/mo annual): 5 Brand Campaigns, 250 Prompts, 6 Models (Variable: $90, Fixed: $25 -> Estimated Cost: $115/mo, Margin: 42.2%).
     * Agency Pro ($499/mo, $399/mo annual): 20 Brand Campaigns, 1,000 Prompts, 6 Models, Priority Weekly Runs & On-Demand Triggers (Variable: $360, Fixed: $35 -> Estimated Cost: $395/mo, Margin: 20.8%).
