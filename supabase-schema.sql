-- InovaSys Manager - Supabase Schema
-- Execute this in Supabase Dashboard > SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj TEXT,
    responsible TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    plan TEXT NOT NULL DEFAULT 'Personalizado',
    plan_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'overdue', 'inactive')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
    project_status TEXT NOT NULL DEFAULT 'active' CHECK (project_status IN ('active', 'paused', 'completed')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_payment TIMESTAMPTZ,
    next_payment TIMESTAMPTZ
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('salaries', 'infrastructure', 'marketing', 'software', 'office', 'other')),
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    paid_date TIMESTAMPTZ,
    is_paid BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_type TEXT CHECK (recurrence_type IN ('monthly', 'yearly')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenues Table
CREATE TABLE IF NOT EXISTS revenues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    paid_date TIMESTAMPTZ,
    is_paid BOOLEAN DEFAULT FALSE,
    type TEXT NOT NULL CHECK (type IN ('mrr', 'one-time', 'project')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domains Table
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    domain TEXT NOT NULL,
    registrar TEXT NOT NULL,
    expiration_date TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    ssl_expiration TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vault Credentials Table
CREATE TABLE IF NOT EXISTS vault_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('api_key', 'password', 'ssh_key', 'token', 'other')),
    encrypted_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table (Kanban)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'review', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Clients Policies
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Revenues Policies
DROP POLICY IF EXISTS "Users can view own revenues" ON revenues;
DROP POLICY IF EXISTS "Users can insert own revenues" ON revenues;
DROP POLICY IF EXISTS "Users can update own revenues" ON revenues;
DROP POLICY IF EXISTS "Users can delete own revenues" ON revenues;

CREATE POLICY "Users can view own revenues" ON revenues
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own revenues" ON revenues
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revenues" ON revenues
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revenues" ON revenues
    FOR DELETE USING (auth.uid() = user_id);

-- Domains Policies
DROP POLICY IF EXISTS "Users can view own domains" ON domains;
DROP POLICY IF EXISTS "Users can insert own domains" ON domains;
DROP POLICY IF EXISTS "Users can update own domains" ON domains;
DROP POLICY IF EXISTS "Users can delete own domains" ON domains;

CREATE POLICY "Users can view own domains" ON domains
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own domains" ON domains
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own domains" ON domains
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own domains" ON domains
    FOR DELETE USING (auth.uid() = user_id);

-- Vault Credentials Policies
DROP POLICY IF EXISTS "Users can view own credentials" ON vault_credentials;
DROP POLICY IF EXISTS "Users can insert own credentials" ON vault_credentials;
DROP POLICY IF EXISTS "Users can update own credentials" ON vault_credentials;
DROP POLICY IF EXISTS "Users can delete own credentials" ON vault_credentials;

CREATE POLICY "Users can view own credentials" ON vault_credentials
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credentials" ON vault_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credentials" ON vault_credentials
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own credentials" ON vault_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- Projects Policies
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_revenues_user_id ON revenues(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_user_id ON vault_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_domains_expiration ON domains(expiration_date);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);
CREATE INDEX IF NOT EXISTS idx_revenues_due_date ON revenues(due_date);
