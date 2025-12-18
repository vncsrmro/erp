"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Globe, Users, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    type: "domain" | "client" | "payment";
    title: string;
    message: string;
    link: string;
    urgent?: boolean;
}

interface NotificationBadgeProps {
    notifications: Notification[];
}

export function NotificationBadge({ notifications }: NotificationBadgeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const urgentCount = notifications.filter((n) => n.urgent).length;
    const totalCount = notifications.length;

    if (totalCount === 0) {
        return (
            <div className="relative p-2 rounded-xl text-text-muted">
                <Bell className="w-5 h-5" />
            </div>
        );
    }

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "domain":
                return Globe;
            case "client":
                return Users;
            case "payment":
                return AlertCircle;
            default:
                return Bell;
        }
    };

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-colors",
                    isOpen
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-background-secondary text-text-secondary hover:text-text-primary"
                )}
            >
                <Bell className="w-5 h-5" />
                {totalCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                            "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center",
                            "text-xs font-bold rounded-full",
                            urgentCount > 0
                                ? "bg-danger text-white"
                                : "bg-warning text-black"
                        )}
                    >
                        {totalCount > 9 ? "9+" : totalCount}
                    </motion.span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={cn(
                                "absolute right-0 top-full mt-2 z-50",
                                "w-80 max-h-96 overflow-hidden",
                                "bg-background-card border border-border rounded-xl shadow-2xl"
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <h3 className="font-semibold text-text-primary">
                                    Notificações
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-lg hover:bg-background-secondary transition-colors"
                                >
                                    <X className="w-4 h-4 text-text-muted" />
                                </button>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-72 overflow-y-auto">
                                {notifications.map((notification) => {
                                    const Icon = getIcon(notification.type);
                                    return (
                                        <Link
                                            key={notification.id}
                                            href={notification.link}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <motion.div
                                                whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                                                className={cn(
                                                    "flex items-start gap-3 px-4 py-3 border-b border-border/50",
                                                    "cursor-pointer transition-colors"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "p-2 rounded-lg flex-shrink-0",
                                                        notification.urgent
                                                            ? "bg-danger/15 text-danger"
                                                            : "bg-warning/15 text-warning"
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-text-primary truncate">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2 bg-background-secondary/50 border-t border-border">
                                <p className="text-xs text-text-muted text-center">
                                    {urgentCount > 0
                                        ? `${urgentCount} alerta(s) urgente(s)`
                                        : "Clique para ver detalhes"}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
