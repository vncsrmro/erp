"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable = true }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={hoverable ? { y: -2, scale: 1.005 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            onClick={onClick}
            className={cn(
                "card-elevated p-5 cursor-pointer",
                onClick && "cursor-pointer",
                className
            )}
        >
            {children}
        </motion.div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = "default",
}: StatCardProps) {
    const variantStyles = {
        default: "text-primary",
        success: "text-success",
        warning: "text-warning",
        danger: "text-danger",
    };

    const glowStyles = {
        default: "group-hover:shadow-glow",
        success: "group-hover:shadow-glow-success",
        warning: "",
        danger: "group-hover:shadow-glow-danger",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -3 }}
            className={cn(
                "group card-elevated p-5 transition-all duration-300",
                glowStyles[variant]
            )}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2.5 rounded-xl bg-background-secondary", variantStyles[variant])}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span
                        className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-full",
                            trend.isPositive
                                ? "bg-success/15 text-success-light"
                                : "bg-danger/15 text-danger-light"
                        )}
                    >
                        {trend.isPositive ? "+" : ""}{trend.value}%
                    </span>
                )}
            </div>
            <h3 className="text-text-secondary text-sm font-medium mb-1">{title}</h3>
            <p className={cn("text-2xl font-bold", variantStyles[variant])}>{value}</p>
            {subtitle && (
                <p className="text-text-muted text-xs mt-1">{subtitle}</p>
            )}
        </motion.div>
    );
}

interface ListItemProps {
    title: string;
    subtitle?: string;
    leftIcon?: LucideIcon;
    rightContent?: React.ReactNode;
    onClick?: () => void;
    badge?: {
        text: string;
        variant: "success" | "warning" | "danger" | "primary";
    };
}

export function ListItem({
    title,
    subtitle,
    leftIcon: LeftIcon,
    rightContent,
    onClick,
    badge,
}: ListItemProps) {
    return (
        <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 p-4 rounded-xl bg-background-secondary border border-border",
                "transition-all duration-200 hover:border-primary/50 hover:bg-background-tertiary",
                onClick && "cursor-pointer"
            )}
        >
            {LeftIcon && (
                <div className="p-2 rounded-lg bg-background-tertiary text-text-secondary">
                    <LeftIcon className="w-5 h-5" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary truncate">{title}</h4>
                {subtitle && (
                    <p className="text-sm text-text-muted truncate">{subtitle}</p>
                )}
            </div>
            {badge && (
                <span className={cn("badge", `badge-${badge.variant}`)}>
                    {badge.text}
                </span>
            )}
            {rightContent}
        </motion.div>
    );
}
