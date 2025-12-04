"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Expense, Revenue } from "@/lib/database.types";
import { useMemo } from "react";

interface CashFlowChartProps {
    expenses: Expense[];
    revenues: Revenue[];
}

export function CashFlowChart({ expenses, revenues }: CashFlowChartProps) {
    const data = useMemo(() => {
        const today = new Date();
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
            return {
                date: d,
                month: d.toLocaleDateString('pt-BR', { month: 'short' }),
                inflows: 0,
                outflows: 0
            };
        });

        revenues.forEach(r => {
            const date = new Date(r.paid_date || r.due_date);
            const monthData = last6Months.find(m =>
                m.date.getMonth() === date.getMonth() &&
                m.date.getFullYear() === date.getFullYear()
            );
            if (monthData && r.is_paid) {
                monthData.inflows += r.amount;
            }
        });

        expenses.forEach(e => {
            const date = new Date(e.paid_date || e.due_date);
            const monthData = last6Months.find(m =>
                m.date.getMonth() === date.getMonth() &&
                m.date.getFullYear() === date.getFullYear()
            );
            if (monthData && e.is_paid) {
                monthData.outflows += e.amount;
            }
        });

        return last6Months;
    }, [expenses, revenues]);

    return (
        <div className="card-elevated p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
                Fluxo de Caixa (6 meses)
            </h3>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorInflows" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOutflows" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#2d2d3a"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#16161e",
                                border: "1px solid #2d2d3a",
                                borderRadius: "12px",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                            }}
                            labelStyle={{ color: "#f8fafc", fontWeight: 600 }}
                            formatter={(value: number, name: string) => [
                                formatCurrency(value),
                                name === "inflows" ? "Receitas" : "Despesas",
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="inflows"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorInflows)"
                        />
                        <Area
                            type="monotone"
                            dataKey="outflows"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorOutflows)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm text-text-secondary">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-danger" />
                    <span className="text-sm text-text-secondary">Despesas</span>
                </div>
            </div>
        </div>
    );
}
