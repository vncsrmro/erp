"use client";

import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

interface AppShellProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    hideBottomNav?: boolean;
}

export function AppShell({
    children,
    title,
    subtitle,
    showSearch = true,
    hideBottomNav = false,
}: AppShellProps) {
    return (
        <div className="min-h-screen bg-background">
            <Header title={title} subtitle={subtitle} showSearch={showSearch} />

            <main className="pb-24 px-4 max-w-7xl mx-auto">
                {children}
            </main>

            {!hideBottomNav && <BottomNav />}
        </div>
    );
}
