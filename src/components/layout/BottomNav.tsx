"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Wallet,
    Settings,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/clients", icon: Users, label: "Clientes" },
    { href: "/projects", icon: FolderKanban, label: "Projetos" },
    { href: "/finance", icon: Wallet, label: "Financeiro" },
    { href: "/domains", icon: Globe, label: "Domínios" },
    { href: "/vault", icon: Settings, label: "Vault" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-strong safe-bottom"
        >
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center py-2 px-3 touch-target"
                        >
                            <motion.div
                                animate={{
                                    scale: isActive ? 1 : 0.9,
                                    y: isActive ? -4 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={cn(
                                    "flex items-center justify-center w-12 h-12 rounded-2xl transition-colors duration-200",
                                    isActive
                                        ? "bg-primary text-white shadow-glow"
                                        : "text-text-muted hover:text-text-secondary"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </motion.div>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isActive ? 1 : 0.7 }}
                                className={cn(
                                    "text-xs mt-1 font-medium",
                                    isActive ? "text-primary-light" : "text-text-muted"
                                )}
                            >
                                {item.label}
                            </motion.span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}
