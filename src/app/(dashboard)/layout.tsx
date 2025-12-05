"use client";

import { LayoutProvider, useLayout } from "@/components/providers/LayoutProvider";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { ReactNode } from "react";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
    const { title, subtitle, headerAction } = useLayout();

    return (
        <div className="min-h-screen bg-background">
            <Header title={title} subtitle={subtitle} headerAction={headerAction} />
            <main className="pb-24 px-4 max-w-7xl mx-auto">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <LayoutProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </LayoutProvider>
    );
}
