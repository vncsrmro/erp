"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { PremiumAuth } from "@/components/ui/PremiumAuth";
import { EtherealShadow } from "@/components/ui/etheral-shadow";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signUp } = useAuth();

    const handleSignIn = async (email: string, password: string) => {
        const result = await signIn(email, password);
        if (!result.error) {
            router.push("/");
        }
        return { error: result.error ? { message: result.error.message } : undefined };
    };

    const handleSignUp = async (email: string, password: string) => {
        const result = await signUp(email, password);
        return { error: result.error ? { message: result.error.message } : undefined };
    };

    const handleForgotPassword = async (email: string) => {
        const supabase = getSupabase();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error: error ? { message: error.message } : undefined };
    };

    const handleSuccess = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ethereal Shadow Background */}
            <EtherealShadow
                color="rgba(16, 185, 129, 0.4)"
                animation={{ scale: 80, speed: 60 }}
                noise={{ opacity: 0.3, scale: 1 }}
                sizing="fill"
                className="fixed inset-0"
            />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Logo / Brand */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-6"
                    >
                        <div className="relative w-48 h-20 mx-auto">
                            <Image
                                src="/logo-white.svg"
                                alt="InovaSys Manager"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-elevated overflow-hidden backdrop-blur-xl bg-background/80 border border-white/10"
                    >
                        <PremiumAuth
                            onSignIn={handleSignIn}
                            onSignUp={handleSignUp}
                            onForgotPassword={handleForgotPassword}
                            onSuccess={handleSuccess}
                        />
                    </motion.div>

                    {/* Footer */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center text-xs text-text-muted mt-8"
                    >
                        Desenvolvido com 💗 pela{" "}
                        <a
                            href="https://inovasys.digital"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 font-medium hover:underline"
                        >
                            InovaSys
                        </a>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
