"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
    id: string;
    message: string;
    variant?: ToastVariant;
    duration?: number;
}

export interface ToastProps extends ToastItem {
    onClose: (id: string) => void;
}

const variantStyles: Record<ToastVariant, { bg: string; icon: typeof CheckCircle; iconColor: string }> = {
    success: {
        bg: "bg-success/15 border-success/30",
        icon: CheckCircle,
        iconColor: "text-success",
    },
    error: {
        bg: "bg-danger/15 border-danger/30",
        icon: AlertCircle,
        iconColor: "text-danger",
    },
    warning: {
        bg: "bg-warning/15 border-warning/30",
        icon: AlertTriangle,
        iconColor: "text-warning",
    },
    info: {
        bg: "bg-primary/15 border-primary/30",
        icon: Info,
        iconColor: "text-primary",
    },
};

export function Toast({ id, message, variant = "info", onClose }: ToastProps) {
    const { bg, icon: Icon, iconColor } = variantStyles[variant];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg shadow-lg",
                "min-w-[280px] max-w-[400px]",
                bg
            )}
        >
            <Icon className={cn("w-5 h-5 flex-shrink-0", iconColor)} />
            <p className="flex-1 text-sm text-text-primary font-medium">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="p-1 rounded-lg hover:bg-background-secondary transition-colors"
            >
                <X className="w-4 h-4 text-text-muted" />
            </button>
        </motion.div>
    );
}

export interface ToastContainerProps {
    toasts: ToastItem[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={onClose} />
                ))}
            </AnimatePresence>
        </div>
    );
}
