"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    CheckCircle,
    Clock,
    Users,
    DollarSign,
    AlertCircle
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, StatCard } from "@/components/ui";
import { ExpenseModal, RevenueModal } from "@/components/modals";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { getSupabase } from "@/lib/supabase";
import { mockExpenses, mockRevenues, mockClients } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Expense, Revenue, Client } from "@/lib/database.types";

type Tab = "overview" | "expenses" | "revenues" | "clients";

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const [revenueModalOpen, setRevenueModalOpen] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [revenues, setRevenues] = useState<Revenue[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);

    const fetchData = useCallback(async () => {
        const supabase = getSupabase();

        try {
            const [expensesRes, revenuesRes, clientsRes] = await Promise.all([
                supabase.from("expenses").select("*").order("due_date"),
                supabase.from("revenues").select("*").order("due_date"),
                supabase.from("clients").select("*").eq("status", "active").order("name"),
            ]);

            if (expensesRes.data) setExpenses(expensesRes.data);
            if (revenuesRes.data) setRevenues(revenuesRes.data);
            if (clientsRes.data) setClients(clientsRes.data);
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
            setClients(mockClients.filter(c => c.status === "active").map(c => ({
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
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExpenseClick = (expense: Expense) => {
        setSelectedExpense(expense);
        setExpenseModalOpen(true);
    };

    const handleRevenueClick = (revenue: Revenue) => {
        setSelectedRevenue(revenue);
        setRevenueModalOpen(true);
    };

    // Calculate client billing data
    const getDaysUntilDue = (billingDay: number) => {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let dueDate: Date;
        if (currentDay <= billingDay) {
            dueDate = new Date(currentYear, currentMonth, billingDay);
        } else {
            dueDate = new Date(currentYear, currentMonth + 1, billingDay);
        }

        today.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getNextDueDate = (billingDay: number) => {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        if (currentDay <= billingDay) {
            return new Date(currentYear, currentMonth, billingDay);
        }
        return new Date(currentYear, currentMonth + 1, billingDay);
    };

    // MRR from active clients
    const mrr = clients.reduce((sum, c) => sum + c.plan_value, 0);

    // Clients due soon (within 7 days)
    const clientsDueSoon = clients
        .map(client => ({
            ...client,
            daysUntilDue: getDaysUntilDue(client.billing_day || 10),
            nextDueDate: getNextDueDate(client.billing_day || 10),
        }))
        .filter(c => c.daysUntilDue <= 7 && c.daysUntilDue >= 0)
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    const totalDueSoon = clientsDueSoon.reduce((sum, c) => sum + c.plan_value, 0);

    // Overdue clients
    const overdueClients = clients.filter(c => c.payment_status === "overdue");
    const totalOverdue = overdueClients.reduce((sum, c) => sum + c.plan_value, 0);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const paidRevenue = revenues.filter((r) => r.is_paid).reduce((sum, r) => sum + r.amount, 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidExpenses = expenses.filter((e) => e.is_paid).reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = totalExpenses - paidExpenses;

    const netProfit = paidRevenue - paidExpenses;

    const tabs = [
        { id: "overview" as Tab, label: "Visão Geral" },
        { id: "clients" as Tab, label: "Mensalidades", count: clientsDueSoon.length },
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
                                    "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "bg-primary text-white shadow-glow"
                                        : "bg-background-secondary text-text-secondary hover:text-text-primary"
                                )}
                            >
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 text-xs rounded-full",
                                        activeTab === tab.id
                                            ? "bg-white/20 text-white"
                                            : "bg-warning/20 text-warning"
                                    )}>
                                        {tab.count}
                                    </span>
                                )}
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
                                    title="MRR"
                                    value={formatCurrency(mrr)}
                                    subtitle={`${clients.length} clientes ativos`}
                                    icon={Users}
                                    variant="primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <StatCard
                                    title="A Receber"
                                    value={formatCurrency(pendingRevenue + totalDueSoon)}
                                    subtitle={`${revenues.filter((r) => !r.is_paid).length + clientsDueSoon.length} pendentes`}
                                    icon={Clock}
                                    variant="warning"
                                />
                                <StatCard
                                    title="A Pagar"
                                    value={formatCurrency(pendingExpenses)}
                                    subtitle={`${expenses.filter((e) => !e.is_paid).length} despesas`}
                                    icon={ArrowDownRight}
                                    variant="danger"
                                />
                            </div>

                            {/* Upcoming Client Payments */}
                            {clientsDueSoon.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-text-primary flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-warning" />
                                            Mensalidades Próximas
                                        </h3>
                                        <span className="text-sm text-warning font-medium">
                                            {formatCurrency(totalDueSoon)}
                                        </span>
                                    </div>
                                    {clientsDueSoon.slice(0, 3).map((client) => (
                                        <div
                                            key={client.id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center text-warning font-bold">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-primary text-sm">{client.name}</p>
                                                    <p className="text-xs text-text-muted">{client.plan}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-warning">{formatCurrency(client.plan_value)}</p>
                                                <p className="text-xs text-text-muted">
                                                    {client.daysUntilDue === 0 ? "Vence hoje" : `${client.daysUntilDue} dias`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <CashFlowChart />
                        </motion.div>
                    )}

                    {/* Client Payments Tab */}
                    {activeTab === "clients" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                                    <p className="text-sm text-text-secondary">MRR Total</p>
                                    <p className="text-2xl font-bold text-primary">{formatCurrency(mrr)}</p>
                                    <p className="text-xs text-text-muted mt-1">{clients.length} clientes ativos</p>
                                </div>
                                <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
                                    <p className="text-sm text-text-secondary">A Vencer (7 dias)</p>
                                    <p className="text-2xl font-bold text-warning">{formatCurrency(totalDueSoon)}</p>
                                    <p className="text-xs text-text-muted mt-1">{clientsDueSoon.length} clientes</p>
                                </div>
                            </div>

                            {overdueClients.length > 0 && (
                                <div className="p-4 rounded-xl bg-danger/10 border border-danger/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-danger" />
                                            <span className="font-medium text-danger">Inadimplentes</span>
                                        </div>
                                        <span className="text-xl font-bold text-danger">{formatCurrency(totalOverdue)}</span>
                                    </div>
                                    <p className="text-sm text-danger/70 mt-1">{overdueClients.length} cliente(s) com pagamento atrasado</p>
                                </div>
                            )}

                            <h3 className="font-medium text-text-primary pt-2">Próximos Vencimentos</h3>

                            <div className="space-y-3">
                                {clients
                                    .map(client => ({
                                        ...client,
                                        daysUntilDue: getDaysUntilDue(client.billing_day || 10),
                                        nextDueDate: getNextDueDate(client.billing_day || 10),
                                    }))
                                    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
                                    .map((client, index) => (
                                        <motion.div
                                            key={client.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-xl border",
                                                client.payment_status === "overdue"
                                                    ? "bg-danger/5 border-danger/20"
                                                    : client.daysUntilDue <= 3
                                                        ? "bg-warning/5 border-warning/20"
                                                        : "bg-background-secondary border-border"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                                                    client.payment_status === "overdue"
                                                        ? "bg-danger/15 text-danger"
                                                        : client.daysUntilDue <= 3
                                                            ? "bg-warning/15 text-warning"
                                                            : "bg-primary/15 text-primary"
                                                )}>
                                                    {client.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-primary">{client.name}</p>
                                                    <p className="text-xs text-text-muted">{client.plan}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-text-primary">{formatCurrency(client.plan_value)}</p>
                                                <p className={cn(
                                                    "text-xs",
                                                    client.payment_status === "overdue"
                                                        ? "text-danger"
                                                        : client.daysUntilDue <= 3
                                                            ? "text-warning"
                                                            : "text-text-muted"
                                                )}>
                                                    Dia {client.billing_day || 10} • {client.daysUntilDue === 0 ? "Hoje" : client.daysUntilDue < 0 ? "Atrasado" : `${client.daysUntilDue}d`}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>
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
                                <Button icon={Plus} size="sm" onClick={() => {
                                    setSelectedExpense(null);
                                    setExpenseModalOpen(true);
                                }}>
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
                                        onClick={() => handleExpenseClick(expense)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors hover:bg-background-tertiary",
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
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <Clock className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-primary">
                                                    {expense.description}
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    {expense.category} • {formatDate(new Date(expense.due_date))}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                "font-semibold",
                                                expense.is_paid ? "text-text-secondary" : "text-danger"
                                            )}
                                        >
                                            {formatCurrency(expense.amount)}
                                        </span>
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
                                <Button icon={Plus} size="sm" onClick={() => {
                                    setSelectedRevenue(null);
                                    setRevenueModalOpen(true);
                                }}>
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
                                        onClick={() => handleRevenueClick(revenue)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors hover:bg-background-tertiary",
                                            revenue.is_paid
                                                ? "bg-background-secondary border-border"
                                                : "bg-success/5 border-success/20"
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
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <Clock className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-primary">
                                                    {revenue.description}
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    {revenue.type} • {formatDate(new Date(revenue.due_date))}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                "font-semibold",
                                                revenue.is_paid ? "text-text-secondary" : "text-success"
                                            )}
                                        >
                                            {formatCurrency(revenue.amount)}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </AppShell>

            <ExpenseModal
                isOpen={expenseModalOpen}
                onClose={() => {
                    setExpenseModalOpen(false);
                    setSelectedExpense(null);
                }}
                onSuccess={fetchData}
                initialData={selectedExpense}
            />

            <RevenueModal
                isOpen={revenueModalOpen}
                onClose={() => {
                    setRevenueModalOpen(false);
                    setSelectedRevenue(null);
                }}
                onSuccess={fetchData}
                initialData={selectedRevenue}
            />
        </>
    );
}
