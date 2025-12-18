"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MRRData {
    month: string;
    mrr: number;
    change?: number;
}

interface MRRGrowthChartProps {
    data: MRRData[];
    className?: string;
}

export function MRRGrowthChart({ data, className }: MRRGrowthChartProps) {
    const maxMRR = Math.max(...data.map(d => d.mrr), 1);
    const currentMRR = data[data.length - 1]?.mrr || 0;
    const previousMRR = data[data.length - 2]?.mrr || 0;
    const change = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;
    const isPositive = change >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card-elevated p-5 ${className}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">Crescimento MRR</h3>
                    <p className="text-sm text-text-muted">Últimos 6 meses</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${isPositive
                            ? "bg-success/15 text-success"
                            : "bg-danger/15 text-danger"
                        }`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(change).toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="h-48 flex items-end gap-2">
                {data.map((item, i) => {
                    const height = (item.mrr / maxMRR) * 100;
                    const isLast = i === data.length - 1;

                    return (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`w-full rounded-t-lg ${isLast
                                        ? "bg-gradient-to-t from-primary to-primary/60"
                                        : "bg-background-tertiary hover:bg-primary/30"
                                    } transition-colors cursor-pointer group relative`}
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-background-primary border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                                        {formatCurrency(item.mrr)}
                                    </div>
                                </div>
                            </motion.div>
                            <span className="text-xs text-text-muted">{item.month}</span>
                        </div>
                    );
                })}
            </div>

            {/* Current MRR Display */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm text-text-muted">MRR Atual</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(currentMRR)}</span>
            </div>
        </motion.div>
    );
}
