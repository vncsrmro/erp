"use client";

import { motion } from "framer-motion";
import { LucideIcon, Users, Globe, Database, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Stat {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    variant?: "default" | "success" | "warning" | "danger";
}

interface CategoryStatsCardProps {
    category: "inovasys" | "paperx";
    title: string;
    subtitle?: string;
    stats: Stat[];
    mrr: number;
    clientCount: number;
    className?: string;
}

const categoryStyles = {
    inovasys: {
        gradient: "from-blue-500/20 to-cyan-500/20",
        border: "border-blue-500/30",
        accent: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    paperx: {
        gradient: "from-emerald-500/20 to-lime-500/20",
        border: "border-emerald-500/30",
        accent: "text-emerald-400",
        bg: "bg-emerald-500/10",
    },
};

export function CategoryStatsCard({
    category,
    title,
    subtitle,
    stats,
    mrr,
    clientCount,
    className,
}: CategoryStatsCardProps) {
    const styles = categoryStyles[category];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={cn(
                "card-elevated p-5 relative overflow-hidden",
                `border ${styles.border}`,
                className
            )}
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-30`} />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className={`text-lg font-bold ${styles.accent}`}>{title}</h3>
                        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
                    </div>
                    <div className={`px-2 py-1 rounded-lg ${styles.bg} text-xs font-medium ${styles.accent}`}>
                        {clientCount} {clientCount === 1 ? "cliente" : "clientes"}
                    </div>
                </div>

                {/* MRR Display */}
                <div className="mb-4">
                    <p className="text-xs text-text-muted mb-1">Receita Recorrente</p>
                    <p className="text-3xl font-bold text-text-primary">{formatCurrency(mrr)}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={i}
                                className="p-3 rounded-xl bg-background-tertiary/50 border border-border/50"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {Icon && <Icon className="w-3 h-3 text-text-muted" />}
                                    <span className="text-xs text-text-muted">{stat.label}</span>
                                </div>
                                <p className={cn(
                                    "text-lg font-semibold",
                                    stat.variant === "success" && "text-success",
                                    stat.variant === "warning" && "text-warning",
                                    stat.variant === "danger" && "text-danger",
                                    !stat.variant && "text-text-primary"
                                )}>
                                    {stat.value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
