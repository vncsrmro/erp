"use client";

import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TrialClient {
    id: string;
    name: string;
    category: "inovasys" | "paperx";
    trial_ends_at: string;
    plan: string;
}

interface TrialAlertsProps {
    clients: TrialClient[];
    className?: string;
}

function daysUntil(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function TrialAlerts({ clients, className }: TrialAlertsProps) {
    const sortedClients = [...clients].sort((a, b) =>
        new Date(a.trial_ends_at).getTime() - new Date(b.trial_ends_at).getTime()
    );

    if (sortedClients.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("card-elevated p-5", className)}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-warning/15">
                    <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                    <h3 className="font-semibold text-text-primary">Trials Expirando</h3>
                    <p className="text-xs text-text-muted">{sortedClients.length} cliente(s) em período de teste</p>
                </div>
            </div>

            <div className="space-y-2">
                {sortedClients.slice(0, 5).map((client, i) => {
                    const days = daysUntil(client.trial_ends_at);
                    const isUrgent = days <= 3;
                    const isExpired = days < 0;

                    return (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link href="/clients">
                                <div className={cn(
                                    "flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer",
                                    "hover:bg-background-secondary",
                                    isUrgent ? "bg-danger/5 border border-danger/20" : "bg-background-tertiary"
                                )}>
                                    <div className="flex items-center gap-3">
                                        {isUrgent && <AlertTriangle className="w-4 h-4 text-danger" />}
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{client.name}</p>
                                            <p className="text-xs text-text-muted">
                                                {client.category === "paperx" ? "PaperX" : "InovaSys"} • {client.plan}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 rounded-lg text-xs font-medium",
                                        isExpired
                                            ? "bg-danger/15 text-danger"
                                            : isUrgent
                                                ? "bg-warning/15 text-warning"
                                                : "bg-primary/15 text-primary"
                                    )}>
                                        {isExpired
                                            ? "Expirado"
                                            : days === 0
                                                ? "Hoje"
                                                : days === 1
                                                    ? "Amanhã"
                                                    : `${days} dias`
                                        }
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {sortedClients.length > 5 && (
                <Link href="/clients?filter=trial">
                    <p className="text-center text-sm text-primary mt-3 hover:underline cursor-pointer">
                        Ver todos ({sortedClients.length})
                    </p>
                </Link>
            )}
        </motion.div>
    );
}
