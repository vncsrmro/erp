"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

interface LogoutButtonProps {
    className?: string;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    showLabel?: boolean;
}

export function LogoutButton({ className, variant = "ghost", showLabel = true }: LogoutButtonProps) {
    const { signOut } = useAuth();

    return (
        <Button
            variant={variant}
            onClick={signOut}
            className={className}
            icon={LogOut}
        >
            {showLabel && "Sair"}
        </Button>
    );
}
