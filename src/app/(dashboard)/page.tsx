"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Globe,
    AlertCircle,
    FileText,
    RefreshCw,
    Wallet,
    DollarSign,
    BarChart3,
    FolderKanban,
    Database,
    Zap,
    Building2,
    Smartphone,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { StatCard } from "@/components/ui";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { MRRGrowthChart, CategoryStatsCard, PlanDistributionChart, TrialAlerts } from "@/components/dashboard";
import { getSupabase } from "@/lib/supabase";
import {
    generateFinancialReport,
    generateClientReport,
    generateDomainReport,
} from "@/lib/reports";
import { formatCurrency, daysUntil, cn } from "@/lib/utils";
import type { Client, Expense, Revenue, Domain, Project } from "@/lib/database.types";

export default function DashboardPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [revenues, setRevenues] = useState<Revenue[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const supabase = getSupabase();

            const results = await Promise.allSettled([
                supabase.from("clients").select("*"),
                supabase.from("expenses").select("*"),
                supabase.from("revenues").select("*"),
                supabase.from("domains").select("*"),
                supabase.from("projects").select("*"),
            ]);

            const [clientsRes, expensesRes, revenuesRes, domainsRes, projectsRes] = results;

            if (clientsRes.status === "fulfilled" && clientsRes.value.data) {
                setClients(clientsRes.value.data);
            }
            if (expensesRes.status === "fulfilled" && expensesRes.value.data) {
                setExpenses(expensesRes.value.data);
            }
            if (revenuesRes.status === "fulfilled" && revenuesRes.value.data) {
                setRevenues(revenuesRes.value.data);
            }
            if (domainsRes.status === "fulfilled" && domainsRes.value.data) {
                setDomains(domainsRes.value.data);
            }
            if (projectsRes.status === "fulfilled" && projectsRes.value.data) {
                setProjects(projectsRes.value.data);
            }

        } catch (error) {
            console.error("Unexpected error fetching dashboard data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Category-based metrics
    const inovasysClients = useMemo(() =>
        clients.filter(c => (c.category || 'inovasys') === 'inovasys'), [clients]);
    const paperxClients = useMemo(() =>
        clients.filter(c => c.category === 'paperx'), [clients]);

    // Active clients by category
    const activeInovasys = inovasysClients.filter(c => c.status === 'active');
    const activePaperx = paperxClients.filter(c => c.status === 'active');

    // MRR calculations
    const mrrInovasys = activeInovasys.reduce((sum, c) => sum + c.plan_value, 0);
    const mrrPaperx = activePaperx.reduce((sum, c) => sum + c.plan_value, 0);
    const totalMRR = mrrInovasys + mrrPaperx;

    // Total users (PaperX)
    const totalPaperxUsers = paperxClients.reduce((sum, c) => sum + (c.user_limit || 0), 0);

    // Total storage (PaperX)
    const totalStorage = paperxClients.reduce((sum, c) => sum + (c.storage_used_gb || 0), 0);

    // Status counts
    const activeClients = clients.filter(c => c.status === 'active').length;
    const trialClients = clients.filter(c => c.status === 'trial');
    const overdueClients = clients.filter(c => c.payment_status === 'overdue').length;
    const inactiveClients = clients.filter(c => c.status === 'inactive').length;

    // Churn rate (simple: inactive / total)
    const churnRate = clients.length > 0
        ? ((inactiveClients / clients.length) * 100).toFixed(1)
        : "0.0";

    // Expiring domains
    const expiringDomains = domains.filter(d => {
        const days = daysUntil(new Date(d.expiration_date));
        return days <= 30;
    }).length;

    // Current month calculations
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const isCurrentMonth = (dateString: string | null) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    };

    // Generate projected revenues from active clients (MRR)
    const getProjectedRevenues = () => {
        const projected: Revenue[] = [];
        clients.forEach(client => {
            if (client.status === 'active' && client.plan_value > 0) {
                const dueDay = client.billing_day || 10;
                const dueDate = new Date(currentYear, currentMonth, dueDay);
                const hasGeneratedInvoice = revenues.some(r =>
                    r.client_id === client.id && isCurrentMonth(r.due_date)
                );
                if (!hasGeneratedInvoice) {
                    projected.push({
                        id: `proj_${client.id}`,
                        description: `Mensalidade - ${client.name}`,
                        amount: client.plan_value,
                        due_date: dueDate.toISOString(),
                        paid_date: null,
                        is_paid: false,
                        type: 'mrr',
                        client_id: client.id,
                        created_at: new Date().toISOString(),
                        user_id: client.user_id
                    });
                }
            }
        });
        return projected;
    };

    const projectedRevenues = getProjectedRevenues();
    const allRevenues = [...revenues, ...projectedRevenues];

    const monthlyRevenue = allRevenues
        .filter(r => r.is_paid && isCurrentMonth(r.paid_date || r.due_date))
        .reduce((sum, r) => sum + r.amount, 0);

    const monthlyExpenses = expenses
        .filter(e => e.is_paid && isCurrentMonth(e.paid_date || e.due_date))
        .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = monthlyRevenue - monthlyExpenses;
    const isProfit = netProfit >= 0;

    const pendingRevenue = allRevenues
        .filter(r => !r.is_paid)
        .reduce((sum, r) => sum + r.amount, 0);

    const pendingExpenses = expenses
        .filter(e => !e.is_paid)
        .reduce((sum, e) => sum + e.amount, 0);

    const activeProjects = projects.filter(p => p.status === "in_progress").length;

    // MRR Growth data (mock historical for now - in production would come from DB)
    const mrrGrowthData = useMemo(() => {
        const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        // Simulate growth pattern based on current MRR
        const baseMRR = totalMRR * 0.7;
        return months.map((month, i) => ({
            month,
            mrr: Math.round(baseMRR + (totalMRR - baseMRR) * ((i + 1) / months.length)),
        }));
    }, [totalMRR]);

    // Plan distribution data
    const planDistribution = useMemo(() => {
        const planCounts: Record<string, { count: number; color: string }> = {};
        clients.forEach(c => {
            const plan = c.plan || 'Sem plano';
            if (!planCounts[plan]) {
                planCounts[plan] = { count: 0, color: '' };
            }
            planCounts[plan].count++;
        });

        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        return Object.entries(planCounts).map(([plan, data], i) => ({
            plan,
            count: data.count,
            color: colors[i % colors.length],
        }));
    }, [clients]);

    // PDF Report handlers
    const handleFinancialReport = () => {
        generateFinancialReport({ clients, expenses, revenues: allRevenues, domains });
    };

    const handleClientReport = () => {
        generateClientReport({ clients, expenses, revenues, domains });
    };

    const handleDomainReport = () => {
        generateDomainReport({ clients, expenses, revenues, domains });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <AppShell title="Dashboard 360°" subtitle="Visão executiva completa do negócio">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 py-4"
            >
                {/* Action Bar */}
                <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={cn(
                                "p-2 rounded-xl bg-background-secondary border border-border",
                                "hover:bg-background-tertiary transition-colors",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                refreshing && "animate-spin"
                            )}
                        >
                            <RefreshCw className="w-4 h-4 text-text-muted" />
                        </motion.button>
                        <span className="text-sm text-text-muted">
                            {loading ? "Carregando..." : "Dados atualizados"}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleFinancialReport}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Financeiro</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleClientReport}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-medium hover:bg-success/20 transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Clientes</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDomainReport}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/10 border border-warning/30 text-warning text-sm font-medium hover:bg-warning/20 transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            <span className="hidden sm:inline">Domínios</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Hero KPIs */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="MRR Total"
                        value={formatCurrency(totalMRR)}
                        subtitle={`${activeClients} clientes ativos`}
                        icon={BarChart3}
                        variant="primary"
                        trend={{ value: 8.5, isPositive: true }}
                    />
                    <StatCard
                        title="Lucro Líquido"
                        value={formatCurrency(netProfit)}
                        subtitle="Este mês"
                        icon={isProfit ? TrendingUp : TrendingDown}
                        variant={isProfit ? "success" : "danger"}
                        trend={{ value: 12.5, isPositive: isProfit }}
                    />
                    <StatCard
                        title="Clientes"
                        value={`${activeClients}/${clients.length}`}
                        subtitle={`${trialClients.length} em trial`}
                        icon={Users}
                        variant="default"
                    />
                    <StatCard
                        title="Churn Rate"
                        value={`${churnRate}%`}
                        subtitle={`${inactiveClients} inativos`}
                        icon={TrendingDown}
                        variant={parseFloat(churnRate) > 5 ? "danger" : "success"}
                    />
                </motion.div>

                {/* Category Cards */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                    <CategoryStatsCard
                        category="inovasys"
                        title="InovaSys"
                        subtitle="Sites, Lojas e Sistemas"
                        mrr={mrrInovasys}
                        clientCount={activeInovasys.length}
                        stats={[
                            { label: "Total Clientes", value: inovasysClients.length, icon: Building2 },
                            { label: "Domínios", value: domains.length, icon: Globe },
                            { label: "Projetos Ativos", value: activeProjects, icon: FolderKanban },
                            {
                                label: "Inadimplentes",
                                value: inovasysClients.filter(c => c.payment_status === 'overdue').length,
                                icon: AlertCircle,
                                variant: inovasysClients.filter(c => c.payment_status === 'overdue').length > 0 ? "danger" : "success"
                            },
                        ]}
                    />
                    <CategoryStatsCard
                        category="paperx"
                        title="PaperX"
                        subtitle="SaaS Multi-Tenant"
                        mrr={mrrPaperx}
                        clientCount={activePaperx.length}
                        stats={[
                            { label: "Total Tenants", value: paperxClients.length, icon: Smartphone },
                            { label: "Usuários", value: totalPaperxUsers, icon: Users },
                            { label: "Storage (GB)", value: totalStorage.toFixed(1), icon: Database },
                            {
                                label: "Em Trial",
                                value: paperxClients.filter(c => c.status === 'trial').length,
                                icon: Zap,
                                variant: "warning"
                            },
                        ]}
                    />
                </motion.div>

                {/* Charts Row */}
                <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <MRRGrowthChart data={mrrGrowthData} />
                    </div>
                    <PlanDistributionChart data={planDistribution} />
                </motion.div>

                {/* Cash Flow & Alerts */}
                <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CashFlowChart expenses={expenses} revenues={allRevenues} />
                    </div>

                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="card-elevated p-5 space-y-3">
                            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-primary" />
                                Resumo Financeiro
                            </h3>

                            <Link href="/finance" className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-success/15 text-success">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                        <span className="text-text-secondary text-sm">A Receber</span>
                                    </div>
                                    <span className="font-semibold text-success">{formatCurrency(pendingRevenue)}</span>
                                </div>
                            </Link>

                            <Link href="/finance" className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-danger/15 text-danger">
                                            <ArrowDownRight className="w-4 h-4" />
                                        </div>
                                        <span className="text-text-secondary text-sm">A Pagar</span>
                                    </div>
                                    <span className="font-semibold text-danger">{formatCurrency(pendingExpenses)}</span>
                                </div>
                            </Link>

                            <Link href="/domains" className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            expiringDomains > 0 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                                        )}>
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <span className="text-text-secondary text-sm">Domínios Vencendo</span>
                                    </div>
                                    <span className={cn(
                                        "font-semibold",
                                        expiringDomains > 0 ? "text-warning" : "text-success"
                                    )}>{expiringDomains}</span>
                                </div>
                            </Link>

                            <Link href="/clients" className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            overdueClients > 0 ? "bg-danger/15 text-danger" : "bg-success/15 text-success"
                                        )}>
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <span className="text-text-secondary text-sm">Inadimplentes</span>
                                    </div>
                                    <span className={cn(
                                        "font-semibold",
                                        overdueClients > 0 ? "text-danger" : "text-success"
                                    )}>{overdueClients}</span>
                                </div>
                            </Link>
                        </div>

                        {/* Trial Alerts */}
                        {trialClients.length > 0 && (
                            <TrialAlerts
                                clients={trialClients.filter(c => c.trial_ends_at).map(c => ({
                                    id: c.id,
                                    name: c.name,
                                    category: c.category || 'inovasys',
                                    trial_ends_at: c.trial_ends_at!,
                                    plan: c.plan,
                                }))}
                            />
                        )}
                    </div>
                </motion.div>

                {/* Recent Clients */}
                <motion.div variants={itemVariants} className="card-elevated p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-text-primary">Clientes Recentes</h3>
                        <Link href="/clients" className="text-sm text-primary hover:underline">
                            Ver todos
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {clients
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .slice(0, 5)
                            .map((client, i) => (
                                <motion.div
                                    key={client.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                                            (client.category || 'inovasys') === 'paperx'
                                                ? "bg-emerald-500/15 text-emerald-400"
                                                : "bg-blue-500/15 text-blue-400"
                                        )}>
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{client.name}</p>
                                            <p className="text-xs text-text-muted">
                                                {(client.category || 'inovasys') === 'paperx' ? 'PaperX' : 'InovaSys'} • {client.plan}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-text-primary">
                                            {formatCurrency(client.plan_value)}
                                        </p>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            client.status === 'active' && "bg-success/15 text-success",
                                            client.status === 'trial' && "bg-warning/15 text-warning",
                                            client.status === 'overdue' && "bg-danger/15 text-danger",
                                            client.status === 'inactive' && "bg-gray-500/15 text-gray-400"
                                        )}>
                                            {client.status === 'active' && 'Ativo'}
                                            {client.status === 'trial' && 'Trial'}
                                            {client.status === 'overdue' && 'Inadimplente'}
                                            {client.status === 'inactive' && 'Inativo'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </motion.div>
            </motion.div>
        </AppShell>
    );
}
