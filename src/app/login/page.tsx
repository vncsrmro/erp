"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { PremiumAuth } from "@/components/ui/PremiumAuth";
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
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
                    className="card-elevated overflow-hidden"
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
                        className="text-primary font-medium hover:underline"
                    >
                        InovaSys
                    </a>
                </motion.p>
            </motion.div>
        </div>
    );
}
