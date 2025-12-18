"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Menu, LogOut } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { daysUntil } from "@/lib/utils";

interface HeaderProps {
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    onMenuClick?: () => void;
    headerAction?: ReactNode;
}

interface Notification {
    id: string;
    type: "domain" | "client" | "payment";
    title: string;
    message: string;
    link: string;
    urgent?: boolean;
}

export function Header({ title, subtitle, showSearch = true, onMenuClick, headerAction }: HeaderProps) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = useCallback(async () => {
        try {
            const supabase = getSupabase();
            const notifs: Notification[] = [];

            // Fetch expiring domains
            const { data: domains } = await supabase.from("domains").select("*");
            if (domains) {
                domains.forEach((domain) => {
                    const days = daysUntil(new Date(domain.expiration_date));
                    if (days <= 30) {
                        notifs.push({
                            id: `domain-${domain.id}`,
                            type: "domain",
                            title: domain.domain,
                            message: days <= 0
                                ? "Domínio expirado!"
                                : `Expira em ${days} dia(s)`,
                            link: "/domains",
                            urgent: days <= 7,
                        });
                    }
                });
            }

            // Fetch overdue clients
            const { data: clients } = await supabase
                .from("clients")
                .select("*")
                .eq("payment_status", "overdue");
            if (clients) {
                clients.forEach((client) => {
                    notifs.push({
                        id: `client-${client.id}`,
                        type: "client",
                        title: client.name,
                        message: "Pagamento em atraso",
                        link: "/clients",
                        urgent: true,
                    });
                });
            }

            setNotifications(notifs);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Refresh every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleLogout = async () => {
        const supabase = getSupabase();
        await supabase.auth.signOut();
        router.push("/login");
    };

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
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-32 h-10 transition-transform group-hover:scale-105">
                            <Image
                                src="/logo-white.svg"
                                alt="InovaSys"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    {headerAction}
                    <NotificationBadge notifications={notifications} />
                    <IconButton
                        icon={LogOut}
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-danger hover:bg-danger/10"
                        tooltip="Sair"
                    />
                </div>
            </div>
        </motion.header>
    );
}
