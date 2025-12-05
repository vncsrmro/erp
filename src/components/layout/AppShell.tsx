"use client";

import { ReactNode, useEffect } from "react";
import { useLayout } from "@/components/providers/LayoutProvider";

interface AppShellProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    showSearch?: boolean; // Kept for interface compatibility, but might be unused now or handled by Header via Context if needed
    hideBottomNav?: boolean; // Handled by Layout? Or should we expose this to Context? For now, DashboardLayout always shows it.
    headerAction?: ReactNode;
}

export function AppShell({
    children,
    title,
    subtitle,
    headerAction,
}: AppShellProps) {
    const { setTitle, setSubtitle, setHeaderAction } = useLayout();

    useEffect(() => {
        setTitle(title);
        setSubtitle(subtitle);
        setHeaderAction(headerAction);
    }, [title, subtitle, headerAction, setTitle, setSubtitle, setHeaderAction]);

    return <>{children}</>;
}

