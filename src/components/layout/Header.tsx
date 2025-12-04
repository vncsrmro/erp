"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Menu } from "lucide-react";
import { IconButton } from "@/components/ui/Button";

interface HeaderProps {
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    onMenuClick?: () => void;
    headerAction?: ReactNode;
}

export function Header({ title, subtitle, showSearch = true, onMenuClick, headerAction }: HeaderProps) {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-40 glass-strong px-4 py-4"
        >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    {onMenuClick && (
                        <IconButton
                            icon={Menu}
                            variant="ghost"
                            onClick={onMenuClick}
                            className="lg:hidden"
                        />
                    )}
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-text-primary">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xs md:text-sm text-text-muted">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {headerAction}
                    {showSearch && (
                        <IconButton
                            icon={Search}
                            variant="secondary"
                            tooltip="Buscar"
                        />
                    )}
                    <div className="relative">
                        <IconButton
                            icon={Bell}
                            variant="secondary"
                            tooltip="Notificações"
                        />
                        {/* Notification badge */}
                        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-danger text-white rounded-full">
                            3
                        </span>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

