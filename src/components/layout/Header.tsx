"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Menu, LogOut } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

interface HeaderProps {
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    onMenuClick?: () => void;
    headerAction?: ReactNode;
}

export function Header({ title, subtitle, showSearch = true, onMenuClick, headerAction }: HeaderProps) {
    const router = useRouter();

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
                                src="/logo.png"
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

