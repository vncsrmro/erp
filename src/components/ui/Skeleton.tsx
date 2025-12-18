"use client";

import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface SkeletonProps {
    className?: string;
    style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-background-tertiary",
                className
            )}
            style={style}
        />
    );
}

export function SkeletonCard({ className }: SkeletonProps) {
    return (
        <div className={cn("card-elevated p-4 space-y-3", className)}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
}

export function SkeletonStatCard({ className }: SkeletonProps) {
    return (
        <div className={cn("card-elevated p-5 space-y-4", className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
}

export function SkeletonChart({ className }: SkeletonProps) {
    return (
        <div className={cn("card-elevated p-5 space-y-4", className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <div className="h-64 flex items-end gap-2 pt-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 rounded-t-lg"
                        style={{ height: `${Math.random() * 60 + 40}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function SkeletonList({ count = 5, className }: SkeletonProps & { count?: number }) {
    return (
        <div className={cn("space-y-3", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background-secondary">
                    <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-6 py-4 animate-in fade-in duration-300">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SkeletonChart />
                </div>
                <div className="card-elevated p-5 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <SkeletonList count={5} />
                </div>
            </div>
        </div>
    );
}
