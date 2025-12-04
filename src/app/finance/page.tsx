"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
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
import { ExpenseModal, RevenueModal } from "@/components/modals";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { getSupabase } from "@/lib/supabase";
import { mockExpenses, mockRevenues } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Expense, Revenue } from "@/lib/database.types";

type Tab = "overview" | "expenses" | "revenues";

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const [revenueModalOpen, setRevenueModalOpen] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [revenues, setRevenues] = useState<Revenue[]>([]);

    const fetchData = useCallback(async () => {
        const supabase = getSupabase();

        try {
            const [expensesRes, revenuesRes] = await Promise.all([
                supabase.from("expenses").select("*").order("due_date"),
                supabase.from("revenues").select("*").order("due_date"),
            ]);

            if (expensesRes.data) setExpenses(expensesRes.data);
            if (revenuesRes.data) setRevenues(revenuesRes.data);
        } catch {
            // Fallback to mock data
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
                recurrence_type: e.recurrenceType || null,
                created_at: new Date().toISOString(),
            })));
            setRevenues(mockRevenues.map(r => ({
                id: r.id,
                user_id: "mock",
                client_id: r.clientId,
                description: r.description,
                amount: r.amount,
                due_date: r.dueDate.toISOString(),
                paid_date: r.paidDate?.toISOString() || null,
                is_paid: r.isPaid,
                type: r.type,
                created_at: new Date().toISOString(),
            })));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const paidRevenue = revenues.filter((r) => r.is_paid).reduce((sum, r) => sum + r.amount, 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidExpenses = expenses.filter((e) => e.is_paid).reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = totalExpenses - paidExpenses;

    const netProfit = paidRevenue - paidExpenses;

    const tabs = [
        { id: "overview" as Tab, label: "Visão Geral" },
        { id: "expenses" as Tab, label: "Despesas" },
        { id: "revenues" as Tab, label: "Receitas" },
    ];

    return (
        <>
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
                                    subtitle={`${revenues.filter((r) => !r.is_paid).length} pendentes`}
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
                                <Button icon={Plus} size="sm" onClick={() => setExpenseModalOpen(true)}>
                                    Nova Despesa
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {expenses.map((expense, index) => (
                                    <motion.div
                                        key={expense.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border",
                                            expense.is_paid
                                                ? "bg-background-secondary border-border"
                                                : "bg-danger/5 border-danger/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "p-2 rounded-lg",
                                                    expense.is_paid
                                                        ? "bg-success/15 text-success"
                                                        : "bg-danger/15 text-danger"
                                                )}
                                            >
                                                {expense.is_paid ? (
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
                                                        {formatDate(new Date(expense.due_date))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p
                                            className={cn(
                                                "font-semibold",
                                                expense.is_paid ? "text-text-secondary" : "text-danger"
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
                                <Button icon={Plus} size="sm" onClick={() => setRevenueModalOpen(true)}>
                                    Nova Receita
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {revenues.map((revenue, index) => (
                                    <motion.div
                                        key={revenue.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border",
                                            revenue.is_paid
                                                ? "bg-background-secondary border-border"
                                                : "bg-warning/5 border-warning/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "p-2 rounded-lg",
                                                    revenue.is_paid
                                                        ? "bg-success/15 text-success"
                                                        : "bg-warning/15 text-warning"
                                                )}
                                            >
                                                {revenue.is_paid ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <Clock className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-primary">
                                                    {revenue.description}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                                    <span className="badge badge-success">
                                                        {revenue.type}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(new Date(revenue.due_date))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p
                                            className={cn(
                                                "font-semibold",
                                                revenue.is_paid ? "text-success" : "text-warning"
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

            <ExpenseModal
                isOpen={expenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
                onSuccess={fetchData}
            />
            <RevenueModal
                isOpen={revenueModalOpen}
                onClose={() => setRevenueModalOpen(false)}
                onSuccess={fetchData}
            />
        </>
    );
}

