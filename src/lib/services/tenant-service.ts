import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface CreateTenantInput {
  name: string;
  slug: string;
  ownerUserId: string;
  settings?: Record<string, unknown>;
}

export class TenantService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Creates a new tenant and assigns the owner role in tenant_members
   */
  async createTenant(input: CreateTenantInput) {
    const { data: tenant, error: tenantError } = await this.supabase
      .from('tenants')
      .insert({
        name: input.name,
        slug: input.slug,
        settings: (input.settings as any) || {},
      })
      .select()
      .single();

    if (tenantError || !tenant) {
      throw new Error(`Failed to create tenant: ${tenantError?.message}`);
    }

    const { error: memberError } = await this.supabase
      .from('tenant_members')
      .insert({
        tenant_id: tenant.id,
        user_id: input.ownerUserId,
        role: 'owner',
      });

    if (memberError) {
      throw new Error(`Failed to assign tenant owner: ${memberError.message}`);
    }

    return tenant;
  }

  /**
   * Retrieves a tenant by ID ensuring multi-tenant isolation
   */
  async getTenantById(tenantId: string) {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) {
      throw new Error(`Tenant not found: ${error.message}`);
    }
    return data;
  }

  /**
   * Retrieves all tenants the current user is a member of
   */
  async getUserTenants(userId: string) {
    const { data, error } = await this.supabase
      .from('tenant_members')
      .select(`
        role,
        tenants (
          id,
          name,
          slug,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to list user tenants: ${error.message}`);
    }
    return data;
  }
}
