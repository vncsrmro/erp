"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Globe,
    AlertCircle,
    FileText,
    Download,
    RefreshCw,
    Wallet,
    Calendar,
    DollarSign,
    BarChart3
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { StatCard, Button } from "@/components/ui";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { getSupabase } from "@/lib/supabase";
import {
    generateFinancialReport,
    generateClientReport,
    generateDomainReport,
} from "@/lib/reports";
import { mockClients, mockExpenses, mockRevenues, mockDomains } from "@/lib/mock-data";
import { formatCurrency, daysUntil, formatDate, cn } from "@/lib/utils";
import type { Client, Expense, Revenue, Domain } from "@/lib/database.types";

export default function DashboardPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [revenues, setRevenues] = useState<Revenue[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const supabase = getSupabase();

            const [clientsRes, expensesRes, revenuesRes, domainsRes] = await Promise.all([
                supabase.from("clients").select("*"),
                supabase.from("expenses").select("*"),
                supabase.from("revenues").select("*"),
                supabase.from("domains").select("*"),
            ]);

            setClients(clientsRes.data || []);
            setExpenses(expensesRes.data || []);
            setRevenues(revenuesRes.data || []);
            setDomains(domainsRes.data || []);
        } catch {
            // Fallback to mock data
            setClients(mockClients.map(c => ({
                id: c.id,
                user_id: "mock",
                name: c.name,
                cnpj: null,
                responsible: null,
                email: c.email,
                phone: c.phone || null,
                plan: c.plan,
                plan_value: c.planValue,
                billing_day: 10,
                status: c.status,
                payment_status: c.paymentStatus,
                project_status: c.projectStatus,
                tags: c.tags,
                created_at: new Date().toISOString(),
                last_payment: c.lastPayment?.toISOString() || null,
                next_payment: c.nextPayment?.toISOString() || null,
            })));
            setExpenses(mockExpenses.map(e => ({
                id: e.id,
                user_id: "mock",
                category: e.category,
                description: e.description,
                amount: e.amount,
                due_date: e.dueDate.toISOString(),
                paid_date: e.paidDate?.toISOString() || null,
                is_paid: e.isPaid,
                is_recurring: e.isRecurring,
                recurrence_type: null,
                created_at: new Date().toISOString(),
            })));
            setRevenues(mockRevenues.map(r => ({
                id: r.id,
                user_id: "mock",
                client_id: r.clientId || null,
                description: r.description,
                amount: r.amount,
                due_date: r.dueDate.toISOString(),
                paid_date: r.paidDate?.toISOString() || null,
                is_paid: r.isPaid,
                type: r.type,
                created_at: new Date().toISOString(),
            })));
            setDomains(mockDomains.map(d => ({
                id: d.id,
                user_id: "mock",
                client_id: d.clientId,
                domain: d.domain,
                registrar: d.registrar,
                expiration_date: d.expirationDate.toISOString(),
                auto_renew: d.autoRenew,
                ssl_expiration: d.sslExpiration?.toISOString() || null,
                notes: null,
                created_at: new Date().toISOString(),
            })));
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
    const totalRevenue = revenues
        .filter((r) => r.is_paid)
        .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = expenses
        .filter((e) => e.is_paid)
        .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    const isProfit = netProfit >= 0;

    const activeClients = clients.filter((c) => c.status === "active").length;
    const overdueClients = clients.filter((c) => c.payment_status === "overdue").length;

    const expiringDomains = domains.filter((d) => {
        const days = daysUntil(new Date(d.expiration_date));
        return days <= 30;
    }).length;

    const pendingRevenue = revenues
        .filter((r) => !r.is_paid)
        .reduce((sum, r) => sum + r.amount, 0);

    const pendingExpenses = expenses
        .filter((e) => !e.is_paid)
        .reduce((sum, e) => sum + e.amount, 0);

    const mrr = clients
        .filter((c) => c.status === "active")
        .reduce((sum, c) => sum + c.plan_value, 0);

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
                    <StatCard
                        title="Lucro Líquido"
                        value={formatCurrency(netProfit)}
                        subtitle="Este mês"
                        icon={isProfit ? TrendingUp : TrendingDown}
                        variant={isProfit ? "success" : "danger"}
                        trend={{ value: 12.5, isPositive: isProfit }}
                    />
                    <StatCard
                        title="MRR"
                        value={formatCurrency(mrr)}
                        subtitle={`${activeClients} clientes ativos`}
                        icon={BarChart3}
                        variant="primary"
                    />
                    <StatCard
                        title="Receitas"
                        value={formatCurrency(totalRevenue)}
                        subtitle={pendingRevenue > 0 ? `${formatCurrency(pendingRevenue)} pendente` : "Tudo recebido"}
                        icon={ArrowUpRight}
                        variant="success"
                    />
                    <StatCard
                        title="Despesas"
                        value={formatCurrency(totalExpenses)}
                        subtitle={pendingExpenses > 0 ? `${formatCurrency(pendingExpenses)} a pagar` : "Tudo pago"}
                        icon={ArrowDownRight}
                        variant="danger"
                    />
                </motion.div>

                {/* Charts Row */}
                <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CashFlowChart />
                    </div>

                    {/* Quick Stats Card */}
                    <div className="card-elevated p-5 space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            Resumo Rápido
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-success/15 text-success">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <span className="text-text-secondary text-sm">A Receber</span>
                                </div>
                                <span className="font-semibold text-success">{formatCurrency(pendingRevenue)}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-danger/15 text-danger">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <span className="text-text-secondary text-sm">A Pagar</span>
                                </div>
                                <span className="font-semibold text-danger">{formatCurrency(pendingExpenses)}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-warning/15 text-warning">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <span className="text-text-secondary text-sm">Domínios Vencendo</span>
                                </div>
                                <span className="font-semibold text-warning">{expiringDomains}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary">
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
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 rounded-xl bg-warning/10 border border-warning/30"
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
                                            <a href="/domains" className="text-sm text-warning underline mt-2 inline-block">
                                                Ver domínios →
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {overdueClients > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 rounded-xl bg-danger/10 border border-danger/30"
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
                                            <a href="/clients" className="text-sm text-danger underline mt-2 inline-block">
                                                Ver clientes →
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
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
                            <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                                <ArrowUpRight className="w-4 h-4 text-success" />
                                A Receber
                            </h4>
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
                            <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                                <ArrowDownRight className="w-4 h-4 text-danger" />
                                A Pagar
                            </h4>
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

