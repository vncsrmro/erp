"use client";

import { motion } from "framer-motion";
import {
    AlertTriangle,
    Globe,
    Calendar,
    ExternalLink
} from "lucide-react";
import { mockDomains } from "@/lib/mock-data";
import { daysUntil, formatDate, getUrgencyLevel, cn } from "@/lib/utils";

export function DomainAlerts() {
    // Get domains expiring within 30 days
    const urgentDomains = mockDomains
        .map((domain) => ({
            ...domain,
            daysRemaining: daysUntil(domain.expirationDate),
        }))
        .filter((d) => d.daysRemaining <= 30)
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

    if (urgentDomains.length === 0) {
        return null;
    }

    return (
        <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold text-text-primary">
                    Domínios a Vencer
                </h3>
            </div>
            <div className="space-y-3">
                {urgentDomains.map((domain, index) => {
                    const urgency = getUrgencyLevel(domain.daysRemaining);
                    return (
                        <motion.div
                            key={domain.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl border",
                                urgency === "critical" && "bg-danger/10 border-danger/30",
                                urgency === "warning" && "bg-warning/10 border-warning/30",
                                urgency === "normal" && "bg-background-secondary border-border"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "p-2 rounded-lg",
                                        urgency === "critical" && "bg-danger/20 text-danger",
                                        urgency === "warning" && "bg-warning/20 text-warning",
                                        urgency === "normal" && "bg-background-tertiary text-text-secondary"
                                    )}
                                >
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary text-sm">
                                        {domain.domain}
                                    </p>
                                    <p className="text-xs text-text-muted">{domain.clientName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p
                                    className={cn(
                                        "text-sm font-semibold",
                                        urgency === "critical" && "text-danger",
                                        urgency === "warning" && "text-warning",
                                        urgency === "normal" && "text-text-secondary"
                                    )}
                                >
                                    {domain.daysRemaining <= 0
                                        ? "Vencido!"
                                        : `${domain.daysRemaining} dias`}
                                </p>
                                <p className="text-xs text-text-muted flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(domain.expirationDate)}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
