"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function SplashScreen() {
    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-64 h-32"
            >
                <Image
                    src="/logo-white.svg"
                    alt="InovaSys Manager"
                    fill
                    className="object-contain"
                    priority
                />
            </motion.div>
        </div>
    );
}
