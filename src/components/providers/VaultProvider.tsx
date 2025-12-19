"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { verifyBiometrics, isBiometricsAvailable } from "@/lib/biometrics";

interface VaultContextType {
    isLocked: boolean;
    lock: () => void;
    unlock: () => void;
    unlockWithBiometrics: () => Promise<boolean>;
    isBiometricsAvailable: boolean;
    isConfigured: boolean;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [isLocked, setIsLocked] = useState(true);
    const [bioAvailable, setBioAvailable] = useState(false);
    const [securitySettings, setSecuritySettings] = useState<any>(null);

    // Initial check for biometrics availability
    useEffect(() => {
        isBiometricsAvailable().then(setBioAvailable);
    }, []);

    // Load security settings from user metadata
    useEffect(() => {
        if (user?.user_metadata?.vault_security) {
            const settings = user.user_metadata.vault_security;
            setSecuritySettings(settings);

            // Default to locked if PIN enabled
            if (settings.pin_enabled) {
                setIsLocked(true);
            } else {
                setIsLocked(false);
            }
        } else {
            // Not configured, so effectively unlocked or just "not secure"
            setIsLocked(false);
        }
    }, [user]);

    const lock = useCallback(() => setIsLocked(true), []);
    const unlock = useCallback(() => setIsLocked(false), []);

    const unlockWithBiometrics = useCallback(async (): Promise<boolean> => {
        if (!securitySettings?.biometrics_enabled) return false;

        try {
            const success = await verifyBiometrics();
            if (success) {
                setIsLocked(false);
                return true;
            }
        } catch (error) {
            console.error("Biometric unlock failed:", error);
        }
        return false;
    }, [securitySettings]);

    const value = {
        isLocked,
        lock,
        unlock,
        unlockWithBiometrics,
        isBiometricsAvailable: bioAvailable,
        isConfigured: !!securitySettings?.pin_enabled
    };

    return (
        <VaultContext.Provider value={value}>
            {children}
        </VaultContext.Provider>
    );
}

export function useVault() {
    const context = useContext(VaultContext);
    if (context === undefined) {
        throw new Error("useVault must be used within a VaultProvider");
    }
    return context;
}
