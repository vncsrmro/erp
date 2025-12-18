"use client";

import { motion } from "framer-motion";
import { PieChart } from "lucide-react";

interface PlanData {
    plan: string;
    count: number;
    color: string;
    revenue?: number;
}

interface PlanDistributionChartProps {
    data: PlanData[];
    title?: string;
    className?: string;
}

export function PlanDistributionChart({ data, title = "Distribuição por Plano", className }: PlanDistributionChartProps) {
    const total = data.reduce((sum, d) => sum + d.count, 0);

    // Calculate percentages and angles for donut
    let currentAngle = 0;
    const segments = data.map(item => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const angle = (percentage / 100) * 360;
        const segment = {
            ...item,
            percentage,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
        };
        currentAngle += angle;
        return segment;
    });

    // SVG donut chart
    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card-elevated p-5 ${className}`}
        >
            <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            </div>

            <div className="flex items-center justify-center gap-8">
                {/* Donut Chart */}
                <div className="relative">
                    <svg width={size} height={size} className="-rotate-90">
                        {/* Background circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-background-tertiary"
                        />

                        {/* Segments */}
                        {segments.map((segment, i) => {
                            const offset = (segment.startAngle / 360) * circumference;
                            const dash = (segment.percentage / 100) * circumference;

                            return (
                                <motion.circle
                                    key={segment.plan}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    fill="none"
                                    stroke={segment.color}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={`${dash} ${circumference}`}
                                    strokeDashoffset={-offset}
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: `0 ${circumference}` }}
                                    animate={{ strokeDasharray: `${dash} ${circumference}` }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                />
                            );
                        })}
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-text-primary">{total}</span>
                        <span className="text-xs text-text-muted">Total</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                    {segments.map(segment => (
                        <div key={segment.plan} className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: segment.color }}
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-text-primary">{segment.plan}</p>
                                <p className="text-xs text-text-muted">
                                    {segment.count} ({segment.percentage.toFixed(0)}%)
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
