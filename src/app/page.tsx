"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Globe,
    AlertCircle
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { StatCard } from "@/components/ui";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { DomainAlerts } from "@/components/domains/DomainAlerts";
import { mockClients, mockExpenses, mockRevenues, mockDomains } from "@/lib/mock-data";
import { formatCurrency, daysUntil } from "@/lib/utils";

export default function DashboardPage() {
    // Calculate KPIs
    const totalRevenue = mockRevenues
        .filter((r) => r.isPaid)
        .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = mockExpenses
        .filter((e) => e.isPaid)
        .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    const isProfit = netProfit >= 0;

    const activeClients = mockClients.filter((c) => c.status === "active").length;
    const overdueClients = mockClients.filter((c) => c.paymentStatus === "overdue").length;

    const expiringDomains = mockDomains.filter(
        (d) => daysUntil(d.expirationDate) <= 30
    ).length;

    const pendingRevenue = mockRevenues
        .filter((r) => !r.isPaid)
        .reduce((sum, r) => sum + r.amount, 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <AppShell title="Dashboard" subtitle="Visão geral do negócio">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 py-4"
            >
                {/* KPI Grid */}
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
                        title="Receitas"
                        value={formatCurrency(totalRevenue)}
                        subtitle={`${pendingRevenue > 0 ? formatCurrency(pendingRevenue) + " pendente" : "Tudo recebido"}`}
                        icon={ArrowUpRight}
                        variant="success"
                    />
                    <StatCard
                        title="Despesas"
                        value={formatCurrency(totalExpenses)}
                        subtitle="Pagas este mês"
                        icon={ArrowDownRight}
                        variant="danger"
                    />
                    <StatCard
                        title="Clientes Ativos"
                        value={activeClients}
                        subtitle={overdueClients > 0 ? `${overdueClients} inadimplente(s)` : "Todos em dia"}
                        icon={Users}
                        variant={overdueClients > 0 ? "warning" : "default"}
                    />
                </motion.div>

                {/* Charts and Alerts Row */}
                <motion.div
                    variants={itemVariants}
                    className="grid lg:grid-cols-2 gap-6"
                >
                    <CashFlowChart />
                    <DomainAlerts />
                </motion.div>

                {/* Quick Stats Row */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-4"
                >
                    <div className="card-elevated p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-xl bg-warning/15 text-warning">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-text-secondary text-sm">Domínios a Vencer</p>
                                <p className="text-2xl font-bold text-warning">{expiringDomains}</p>
                            </div>
                        </div>
                        <p className="text-xs text-text-muted">Próximos 30 dias</p>
                    </div>

                    <div className="card-elevated p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 rounded-xl bg-danger/15 text-danger">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-text-secondary text-sm">Inadimplentes</p>
                                <p className="text-2xl font-bold text-danger">{overdueClients}</p>
                            </div>
                        </div>
                        <p className="text-xs text-text-muted">Requerem atenção</p>
                    </div>
                </motion.div>
            </motion.div>
        </AppShell>
    );
}
