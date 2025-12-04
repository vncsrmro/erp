"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, Loader2 } from "lucide-react";

interface ButtonProps {
    children?: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    loading?: boolean;
    fullWidth?: boolean;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    iconPosition = "left",
    loading = false,
    fullWidth = false,
    className,
    disabled,
    onClick,
    type = "button",
}: ButtonProps) {
    const variantStyles = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        danger: "bg-danger hover:bg-danger-dark text-white font-semibold",
        ghost: "bg-transparent hover:bg-background-secondary text-text-secondary hover:text-text-primary",
    };

    const sizes = {
        sm: "text-sm px-3 py-2",
        md: "text-base px-5 py-3",
        lg: "text-lg px-6 py-4",
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all touch-target",
                variantStyles[variant],
                sizes[size],
                fullWidth && "w-full",
                (disabled || loading) && "opacity-50 cursor-not-allowed",
                className
            )}
            disabled={disabled || loading}
            onClick={onClick}
            type={type}
        >
            {loading && <Loader2 className={cn(iconSizes[size], "animate-spin")} />}
            {!loading && Icon && iconPosition === "left" && (
                <Icon className={iconSizes[size]} />
            )}
            {children}
            {!loading && Icon && iconPosition === "right" && (
                <Icon className={iconSizes[size]} />
            )}
        </motion.button>
    );
}

interface IconButtonProps {
    icon: LucideIcon;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    tooltip?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export function IconButton({
    icon: Icon,
    variant = "ghost",
    size = "md",
    tooltip,
    className,
    onClick,
    disabled,
}: IconButtonProps) {
    const variantStyles = {
        primary: "bg-primary text-white hover:bg-primary-dark",
        secondary: "bg-background-secondary text-text-secondary hover:text-text-primary border border-border hover:border-primary",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-background-secondary",
    };

    const sizes = {
        sm: "p-2",
        md: "p-2.5",
        lg: "p-3",
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={tooltip}
            className={cn(
                "rounded-xl transition-all touch-target",
                variantStyles[variant],
                sizes[size],
                className
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon className={iconSizes[size]} />
        </motion.button>
    );
}
