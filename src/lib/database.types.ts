export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    email: string;
                    phone: string | null;
                    plan: 'starter' | 'professional' | 'enterprise';
                    plan_value: number;
                    status: 'active' | 'trial' | 'overdue' | 'inactive';
                    payment_status: 'paid' | 'pending' | 'overdue';
                    project_status: 'active' | 'paused' | 'completed';
                    tags: string[];
                    created_at: string;
                    last_payment: string | null;
                    next_payment: string | null;
                };
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            domains: {
                Row: {
                    id: string;
                    user_id: string;
                    client_id: string | null;
                    domain: string;
                    registrar: string;
                    expiration_date: string;
                    auto_renew: boolean;
                    ssl_expiration: string | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            expenses: {
                Row: {
                    id: string;
                    user_id: string;
                    category: 'salaries' | 'infrastructure' | 'marketing' | 'software' | 'office' | 'other';
                    description: string;
                    amount: number;
                    due_date: string;
                    paid_date: string | null;
                    is_paid: boolean;
                    is_recurring: boolean;
                    recurrence_type: 'monthly' | 'yearly' | null;
                    created_at: string;
                };
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            revenues: {
                Row: {
                    id: string;
                    user_id: string;
                    client_id: string | null;
                    description: string;
                    amount: number;
                    due_date: string;
                    paid_date: string | null;
                    is_paid: boolean;
                    type: 'mrr' | 'one-time' | 'project';
                    created_at: string;
                };
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            vault_credentials: {
                Row: {
                    id: string;
                    user_id: string;
                    client_id: string | null;
                    name: string;
                    type: 'api_key' | 'password' | 'ssh_key' | 'token' | 'other';
                    encrypted_value: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
        };
    };
}

// Helper types for easier usage
export type Client = Database['public']['Tables']['clients']['Row'];
export type Domain = Database['public']['Tables']['domains']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type Revenue = Database['public']['Tables']['revenues']['Row'];
export type VaultCredential = Database['public']['Tables']['vault_credentials']['Row'];

// Simple insert types for modals
export type ClientInsert = Omit<Client, 'id' | 'created_at'>;
export type DomainInsert = Omit<Domain, 'id' | 'created_at'>;
export type ExpenseInsert = Omit<Expense, 'id' | 'created_at'>;
export type RevenueInsert = Omit<Revenue, 'id' | 'created_at'>;
export type VaultCredentialInsert = Omit<VaultCredential, 'id' | 'created_at' | 'updated_at'>;
