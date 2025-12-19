"use client";

import { motion } from "framer-motion";

interface LoadingAnimationProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingAnimation({ className = "", size = "lg" }: LoadingAnimationProps) {
    const sizeClasses = {
        sm: "w-16 h-8",
        md: "w-32 h-16",
        lg: "w-48 h-24",
        xl: "w-64 h-32",
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <motion.div
                className={`relative ${sizeClasses[size]}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 280 140"
                    fill="none"
                    className="w-full h-full"
                >
                    {/* Code Symbol </> */}
                    <motion.g
                        stroke="#FFFFFF"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        transition={{
                            duration: 1.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse",
                            repeatDelay: 0.5
                        }}
                    >
                        {/* Left bracket < */}
                        <motion.path
                            d="M115 12 L95 32 L115 52"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        {/* Forward slash / */}
                        <motion.path
                            d="M133 8 L153 56"
                            initial={{ scale: 0, opacity: 0, transformOrigin: "center" }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                        {/* Right bracket > */}
                        <motion.path
                            d="M165 12 L185 32 L165 52"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                    </motion.g>

                    {/* Text "inovasys" */}
                    <motion.g
                        fill="#FFFFFF"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <text
                            x="140"
                            y="90"
                            textAnchor="middle"
                            fontFamily="Poppins, system-ui, -apple-system, sans-serif"
                            fontWeight="800"
                            fontSize="36"
                            letterSpacing="-1"
                        >
                            inovasys
                        </text>
                    </motion.g>

                    {/* Tagline - pulsing */}
                    <motion.g
                        fill="#FFFFFF"
                        opacity="0.7"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                        <text
                            x="140"
                            y="115"
                            textAnchor="middle"
                            fontFamily="Poppins, system-ui, -apple-system, sans-serif"
                            fontWeight="400"
                            fontSize="11"
                            fontStyle="italic"
                            letterSpacing="0.5"
                        >
                            soluções que transformam o seu negócio
                        </text>
                    </motion.g>
                </svg>
            </motion.div>
        </div>
    );
}
