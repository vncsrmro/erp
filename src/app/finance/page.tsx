"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Calendar,
    CheckCircle,
    Clock
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, StatCard } from "@/components/ui";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { mockExpenses, mockRevenues } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

type Tab = "overview" | "expenses" | "revenues";

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    const totalRevenue = mockRevenues.reduce((sum, r) => sum + r.amount, 0);
    const paidRevenue = mockRevenues.filter((r) => r.isPaid).reduce((sum, r) => sum + r.amount, 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
    const paidExpenses = mockExpenses.filter((e) => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = totalExpenses - paidExpenses;

    const netProfit = paidRevenue - paidExpenses;

    const tabs = [
        { id: "overview" as Tab, label: "Visão Geral" },
        { id: "expenses" as Tab, label: "Despesas" },
        { id: "revenues" as Tab, label: "Receitas" },
    ];

    return (
        <AppShell title="Financeiro" subtitle="Controle de fluxo de caixa">
            <div className="space-y-6 py-4">
                {/* Tab Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-glow"
                                    : "bg-background-secondary text-text-secondary hover:text-text-primary"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                title="Lucro Líquido"
                                value={formatCurrency(netProfit)}
                                subtitle="Realizado"
                                icon={netProfit >= 0 ? ArrowUpRight : ArrowDownRight}
                                variant={netProfit >= 0 ? "success" : "danger"}
                            />
                            <StatCard
                                title="A Receber"
                                value={formatCurrency(pendingRevenue)}
                                subtitle={`${mockRevenues.filter((r) => !r.isPaid).length} pendentes`}
                                icon={Clock}
                                variant="warning"
                            />
                        </div>
                        <CashFlowChart />
                    </motion.div>
                )}

                {/* Expenses Tab */}
                {activeTab === "expenses" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm">Total Pendente</p>
                                <p className="text-xl font-bold text-danger">
                                    {formatCurrency(pendingExpenses)}
                                </p>
                            </div>
                            <Button icon={Plus} size="sm">
                                Nova Despesa
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {mockExpenses.map((expense, index) => (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border",
                                        expense.isPaid
                                            ? "bg-background-secondary border-border"
                                            : "bg-danger/5 border-danger/20"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "p-2 rounded-lg",
                                                expense.isPaid
                                                    ? "bg-success/15 text-success"
                                                    : "bg-danger/15 text-danger"
                                            )}
                                        >
                                            {expense.isPaid ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <Clock className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary">
                                                {expense.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                                <span className="badge badge-primary">
                                                    {expense.category}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(expense.dueDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p
                                        className={cn(
                                            "font-semibold",
                                            expense.isPaid ? "text-text-secondary" : "text-danger"
                                        )}
                                    >
                                        {formatCurrency(expense.amount)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Revenues Tab */}
                {activeTab === "revenues" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm">Total a Receber</p>
                                <p className="text-xl font-bold text-success">
                                    {formatCurrency(pendingRevenue)}
                                </p>
                            </div>
                            <Button icon={Plus} size="sm">
                                Nova Receita
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {mockRevenues.map((revenue, index) => (
                                <motion.div
                                    key={revenue.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border",
                                        revenue.isPaid
                                            ? "bg-background-secondary border-border"
                                            : "bg-warning/5 border-warning/20"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "p-2 rounded-lg",
                                                revenue.isPaid
                                                    ? "bg-success/15 text-success"
                                                    : "bg-warning/15 text-warning"
                                            )}
                                        >
                                            {revenue.isPaid ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <Clock className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary">
                                                {revenue.clientName}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                                <span className="badge badge-success">
                                                    {revenue.type}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(revenue.dueDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p
                                        className={cn(
                                            "font-semibold",
                                            revenue.isPaid ? "text-success" : "text-warning"
                                        )}
                                    >
                                        {formatCurrency(revenue.amount)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </AppShell>
    );
}
