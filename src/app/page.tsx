"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
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
    Calendar,
    DollarSign,
    BarChart3,
    FolderKanban,
    CheckCircle2,
    Clock
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { StatCard } from "@/components/ui";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { getSupabase } from "@/lib/supabase";
import {
    generateFinancialReport,
    generateClientReport,
    generateDomainReport,
} from "@/lib/reports";
import { mockClients, mockExpenses, mockRevenues, mockDomains, mockProjects } from "@/lib/mock-data";
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

            // Log errors for debugging
            results.forEach((res, index) => {
                if (res.status === "rejected") {
                    console.error(`Error fetching data at index ${index}:`, res.reason);
                } else if (res.value.error) {
                    console.error(`Supabase error at index ${index}:`, res.value.error);
                }
            });

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

    // Calculate KPIs
    // Calculate KPIs
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const isCurrentMonth = (dateString: string | null) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    };

    const monthlyRevenue = revenues
        .filter((r) => r.is_paid && isCurrentMonth(r.paid_date || r.due_date))
        .reduce((sum, r) => sum + r.amount, 0);

    const monthlyExpenses = expenses
        .filter((e) => e.is_paid && isCurrentMonth(e.paid_date || e.due_date))
        .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = monthlyRevenue - monthlyExpenses;
    const isProfit = netProfit >= 0;

    // Total stats for other cards (if needed, or keep them as total?)
    // The "Receitas" and "Despesas" cards below Net Profit currently show TOTAL.
    // The subtitle says "pendente" or "a pagar".
    // Usually these cards show "This Month" too in a dashboard.
    // Let's update them to show "This Month" as well, or clarify.
    // The user complained about "other months info".
    // So I should probably filter ALL of them to be Current Month, OR clearly label them.
    // "Receitas" card currently shows `totalRevenue` (all time paid).
    // I will change it to `monthlyRevenue` to match "Lucro Líquido".
    // And `pendingRevenue` should probably be "Pending This Month" or "Total Pending"?
    // "Total Pending" is usually more useful.
    // But "Total Revenue" (paid) should definitely be monthly if the label implies current status.
    // Let's stick to Monthly for the main numbers to be consistent.

    const totalRevenue = monthlyRevenue; // Update variable name usage or just reassign
    const totalExpenses = monthlyExpenses;

    const activeClients = clients.filter((c) => c.status === "active").length;
    const overdueClients = clients.filter((c) => c.payment_status === "overdue").length;

    const expiringDomains = domains.filter((d) => {
        const days = daysUntil(new Date(d.expiration_date));
        return days <= 30;
    }).length;

    // Pending revenues from invoices/revenues table
    const pendingInvoices = revenues
        .filter((r) => !r.is_paid)
        .reduce((sum, r) => sum + r.amount, 0);

    // MRR from active clients (expected monthly recurring revenue)
    const mrr = clients
        .filter((c) => c.status === "active")
        .reduce((sum, c) => sum + c.plan_value, 0);

    // Total A Receber = Pending Invoices + MRR (expected this month from clients)
    const pendingRevenue = pendingInvoices + mrr;

    const pendingExpenses = expenses
        .filter((e) => !e.is_paid)
        .reduce((sum, e) => sum + e.amount, 0);

    const activeProjects = projects.filter(p => p.status === "in_progress").length;
    const backlogProjects = projects.filter(p => p.status === "backlog").length;

    // PDF Report handlers
    const handleFinancialReport = () => {
        generateFinancialReport({ clients, expenses, revenues, domains });
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
            transition: { staggerChildren: 0.08 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <AppShell title="Dashboard 360°" subtitle="Visão completa do negócio">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 py-4"
            >
                {/* Action Bar */}
                <motion.div variants={itemVariants} className="flex items-center justify-between">
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

                    {/* Report Buttons */}
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

                {/* Main KPI Grid */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <Link href="/finance">
                        <StatCard
                            title="Lucro Líquido"
                            value={formatCurrency(netProfit)}
                            subtitle="Este mês"
                            icon={isProfit ? TrendingUp : TrendingDown}
                            variant={isProfit ? "success" : "danger"}
                            trend={{ value: 12.5, isPositive: isProfit }}
                        />
                    </Link>
                    <Link href="/finance">
                        <StatCard
                            title="MRR"
                            value={formatCurrency(mrr)}
                            subtitle={`${activeClients} clientes ativos`}
                            icon={BarChart3}
                            variant="primary"
                        />
                    </Link>
                    <Link href="/finance">
                        <StatCard
                            title="Receitas"
                            value={formatCurrency(totalRevenue)}
                            subtitle={pendingRevenue > 0 ? `${formatCurrency(pendingRevenue)} pendente` : "Tudo recebido"}
                            icon={ArrowUpRight}
                            variant="success"
                        />
                    </Link>
                    <Link href="/finance">
                        <StatCard
                            title="Despesas"
                            value={formatCurrency(totalExpenses)}
                            subtitle={pendingExpenses > 0 ? `${formatCurrency(pendingExpenses)} a pagar` : "Tudo pago"}
                            icon={ArrowDownRight}
                            variant="danger"
                        />
                    </Link>
                </motion.div>

                {/* Charts Row */}
                <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CashFlowChart expenses={expenses} revenues={revenues} />
                    </div>

                    {/* Quick Stats Card */}
                    <div className="card-elevated p-5 space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            Resumo Rápido
                        </h3>

                        <div className="space-y-3">
                            <Link href="/finance" className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-success/15 text-success">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <span className="text-text-secondary text-sm">A Receber</span>
                                    </div>
                                    <span className="font-semibold text-success">{formatCurrency(pendingRevenue)}</span>
                                </div>
                            </Link>

                            <Link href="/finance" className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-danger/15 text-danger">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <span className="text-text-secondary text-sm">A Pagar</span>
                                    </div>
                                    <span className="font-semibold text-danger">{formatCurrency(pendingExpenses)}</span>
                                </div>
                            </Link>

                            <Link href="/domains" className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-warning/15 text-warning">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <span className="text-text-secondary text-sm">Domínios Vencendo</span>
                                    </div>
                                    <span className="font-semibold text-warning">{expiringDomains}</span>
                                </div>
                            </Link>

                            <Link href="/clients" className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            overdueClients > 0 ? "bg-danger/15 text-danger" : "bg-success/15 text-success"
                                        )}>
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <span className="text-text-secondary text-sm">Inadimplentes</span>
                                    </div>
                                    <span className={cn(
                                        "font-semibold",
                                        overdueClients > 0 ? "text-danger" : "text-success"
                                    )}>
                                        {overdueClients}
                                    </span>
                                </div>
                            </Link>

                            <Link href="/projects" className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary hover:bg-background-secondary transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/15 text-primary">
                                            <FolderKanban className="w-4 h-4" />
                                        </div>
                                        <span className="text-text-secondary text-sm">Projetos Ativos</span>
                                    </div>
                                    <span className="font-semibold text-primary">{activeProjects}</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Alerts Section */}
                {(expiringDomains > 0 || overdueClients > 0) && (
                    <motion.div variants={itemVariants}>
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-warning" />
                            Alertas que Requerem Atenção
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            {expiringDomains > 0 && (
                                <Link href="/domains">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 rounded-xl bg-warning/10 border border-warning/30 hover:bg-warning/15 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 rounded-xl bg-warning/20 text-warning">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-warning">Domínios Expirando</h4>
                                                <p className="text-sm text-warning/80 mt-1">
                                                    {expiringDomains} domínio(s) vencem nos próximos 30 dias
                                                </p>
                                                <span className="text-sm text-warning underline mt-2 inline-block">
                                                    Ver domínios →
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            )}

                            {overdueClients > 0 && (
                                <Link href="/clients">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 rounded-xl bg-danger/10 border border-danger/30 hover:bg-danger/15 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 rounded-xl bg-danger/20 text-danger">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-danger">Clientes Inadimplentes</h4>
                                                <p className="text-sm text-danger/80 mt-1">
                                                    {overdueClients} cliente(s) com pagamento atrasado
                                                </p>
                                                <span className="text-sm text-danger underline mt-2 inline-block">
                                                    Ver clientes →
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Recent Activity */}
                <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Próximos Vencimentos
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Upcoming Revenues */}
                        <div className="card-elevated p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                    <ArrowUpRight className="w-4 h-4 text-success" />
                                    A Receber
                                </h4>
                                <Link href="/finance" className="text-xs text-primary hover:underline">
                                    Ver tudo
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {revenues
                                    .filter((r) => !r.is_paid)
                                    .slice(0, 4)
                                    .map((r) => (
                                        <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-background-tertiary">
                                            <span className="text-sm text-text-primary truncate flex-1">{r.description}</span>
                                            <span className="text-sm font-medium text-success ml-2">{formatCurrency(r.amount)}</span>
                                        </div>
                                    ))}
                                {revenues.filter((r) => !r.is_paid).length === 0 && (
                                    <p className="text-sm text-text-muted py-3 text-center">Nenhum valor pendente</p>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Expenses */}
                        <div className="card-elevated p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                    <ArrowDownRight className="w-4 h-4 text-danger" />
                                    A Pagar
                                </h4>
                                <Link href="/finance" className="text-xs text-primary hover:underline">
                                    Ver tudo
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {expenses
                                    .filter((e) => !e.is_paid)
                                    .slice(0, 4)
                                    .map((e) => (
                                        <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-background-tertiary">
                                            <span className="text-sm text-text-primary truncate flex-1">{e.description}</span>
                                            <span className="text-sm font-medium text-danger ml-2">{formatCurrency(e.amount)}</span>
                                        </div>
                                    ))}
                                {expenses.filter((e) => !e.is_paid).length === 0 && (
                                    <p className="text-sm text-text-muted py-3 text-center">Nenhuma despesa pendente</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AppShell>
    );
}
