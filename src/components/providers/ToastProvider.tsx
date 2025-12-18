"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ToastContainer, ToastItem, ToastVariant } from "@/components/ui/Toast";

interface ToastContextType {
    showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, variant: ToastVariant = "info", duration: number = 4000) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            setToasts((prev) => [...prev, { id, message, variant, duration }]);

            // Auto-remove after duration
            setTimeout(() => {
                removeToast(id);
            }, duration);
        },
        [removeToast]
    );

    const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
    const error = useCallback((message: string) => showToast(message, "error"), [showToast]);
    const warning = useCallback((message: string) => showToast(message, "warning"), [showToast]);
    const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
