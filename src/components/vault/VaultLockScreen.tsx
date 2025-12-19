"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Smartphone, Delete } from "lucide-react";
import { Button } from "@/components/ui/Button"; // Check if Button exists or use custom
import { verifyBiometrics, isBiometricsAvailable } from "@/lib/biometrics";
import { cn } from "@/lib/utils";

interface VaultLockScreenProps {
    onUnlock: () => void;
    correctPin: string;
    biometricsEnabled: boolean;
}

export function VaultLockScreen({ onUnlock, correctPin, biometricsEnabled }: VaultLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [isBioAvailable, setIsBioAvailable] = useState(false);

    useEffect(() => {
        const check = async () => {
            const avail = await isBiometricsAvailable();
            setIsBioAvailable(avail);
        };
        check();
    }, [biometricsEnabled]);

    const handleNumberClick = (num: number) => {
        if (pin.length < 6) {
            const newPin = pin + num;
            setPin(newPin);
            setError(false);

            // Check instantly if it matches correct pin (assuming correctPin length is known or we try at 4, 5, 6)
            if (newPin === correctPin) {
                onUnlock();
            } else if (newPin.length === correctPin.length) {
                // If wrong length match
                setError(true);
                setTimeout(() => setPin(""), 500);
            }
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleBiometricUnlock = async () => {
        const success = await verifyBiometrics();
        if (success) {
            onUnlock();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm"
            >
                <div className="mb-8 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">Vault Bloqueado</h2>
                    <p className="text-text-secondary mt-2">
                        Digite seu PIN para acessar suas credenciais
                    </p>
                </div>

                {/* PIN Dots */}
                <div className="flex justify-center gap-4 mb-8">
                    {[...Array(correctPin.length || 4)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-4 h-4 rounded-full transition-all duration-300",
                                i < pin.length
                                    ? error
                                        ? "bg-danger"
                                        : "bg-primary"
                                    : "bg-background-tertiary border border-border"
                            )}
                        />
                    ))}
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="w-16 h-16 rounded-full text-2xl font-medium text-text-primary hover:bg-background-secondary transition-colors border border-transparent hover:border-border flex items-center justify-center"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="flex items-center justify-center">
                        {biometricsEnabled && isBioAvailable && (
                            <button
                                onClick={handleBiometricUnlock}
                                className="w-16 h-16 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                                title="Usar Biometria"
                            >
                                <Smartphone className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => handleNumberClick(0)}
                        className="w-16 h-16 rounded-full text-2xl font-medium text-text-primary hover:bg-background-secondary transition-colors border border-transparent hover:border-border flex items-center justify-center"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-16 h-16 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                    <Shield className="w-3 h-3" />
                    <span>Protegido por criptografia local</span>
                </div>
            </motion.div>
        </div>
    );
}
