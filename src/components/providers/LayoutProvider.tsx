"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LayoutContextType {
    title: string;
    setTitle: (title: string) => void;
    subtitle: string | undefined;
    setSubtitle: (subtitle: string | undefined) => void;
    headerAction: ReactNode | undefined;
    setHeaderAction: (action: ReactNode | undefined) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
    const [headerAction, setHeaderAction] = useState<ReactNode | undefined>(undefined);

    return (
        <LayoutContext.Provider value={{ title, setTitle, subtitle, setSubtitle, headerAction, setHeaderAction }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error("useLayout must be used within a LayoutProvider");
    }
    return context;
}
