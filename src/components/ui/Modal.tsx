"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "full";
}

export function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = "md",
}: ModalProps) {
    // Handle ESC key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, handleEscape]);

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        full: "max-w-full mx-4",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container - Mobile First */}
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 300,
                        }}
                        className={cn(
                            "fixed inset-x-0 bottom-0 z-50 mx-auto",
                            "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
                            sizeClasses[size],
                            "w-full"
                        )}
                    >
                        <div
                            className={cn(
                                "bg-background-secondary border border-border",
                                "rounded-t-3xl md:rounded-2xl",
                                "max-h-[90vh] md:max-h-[85vh]",
                                "flex flex-col",
                                "shadow-2xl shadow-black/20"
                            )}
                        >
                            {/* Drag Handle (Mobile) */}
                            <div className="flex justify-center pt-3 md:hidden">
                                <div className="w-10 h-1 rounded-full bg-text-muted/30" />
                            </div>

                            {/* Header */}
                            <div className="flex items-start justify-between p-5 pb-4 border-b border-border">
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <p className="text-sm text-text-muted mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 -m-2 rounded-xl hover:bg-background-tertiary text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-5 overscroll-contain">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
