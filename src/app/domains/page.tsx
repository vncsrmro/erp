"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Plus,
    Globe,
    Calendar,
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    RefreshCw,
    Search
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { mockDomains } from "@/lib/mock-data";
import { formatDate, daysUntil, getUrgencyLevel, cn } from "@/lib/utils";

export default function DomainsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const domainsWithDays = mockDomains
        .map((domain) => ({
            ...domain,
            daysRemaining: daysUntil(domain.expirationDate),
        }))
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const filteredDomains = domainsWithDays.filter(
        (domain) =>
            domain.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
            domain.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const urgentCount = domainsWithDays.filter((d) => d.daysRemaining <= 30).length;

    return (
        <AppShell title="Domínios" subtitle={`${mockDomains.length} domínios gerenciados`}>
            <div className="space-y-4 py-4">
                {/* Alert Banner */}
                {urgentCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30"
                    >
                        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                        <p className="text-sm text-warning">
                            <span className="font-semibold">{urgentCount} domínio(s)</span> vencem nos próximos 30 dias
                        </p>
                    </motion.div>
                )}

                {/* Search and Add */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar domínio..."
                            icon={Search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button icon={Plus} size="md">
                        Novo
                    </Button>
                </div>

                {/* Domain List */}
                <div className="space-y-3">
                    {filteredDomains.map((domain, index) => {
                        const urgency = getUrgencyLevel(domain.daysRemaining);
                        return (
                            <motion.div
                                key={domain.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "card-elevated p-4",
                                    urgency === "critical" && "border-danger/50",
                                    urgency === "warning" && "border-warning/50"
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "p-2.5 rounded-xl",
                                                urgency === "critical" && "bg-danger/15 text-danger",
                                                urgency === "warning" && "bg-warning/15 text-warning",
                                                urgency === "normal" && "bg-primary/15 text-primary"
                                            )}
                                        >
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-text-primary">
                                                    {domain.domain}
                                                </h3>
                                                <a
                                                    href={`https://${domain.domain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-text-muted hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                            <p className="text-sm text-text-muted">{domain.clientName}</p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-sm font-semibold",
                                            urgency === "critical" && "bg-danger/15 text-danger",
                                            urgency === "warning" && "bg-warning/15 text-warning",
                                            urgency === "normal" && "bg-success/15 text-success"
                                        )}
                                    >
                                        {domain.daysRemaining <= 0
                                            ? "Vencido!"
                                            : `${domain.daysRemaining} dias`}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex items-center gap-4 text-sm text-text-secondary">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Vence: {formatDate(domain.expirationDate)}
                                    </span>
                                    <span className="text-text-muted">|</span>
                                    <span>{domain.registrar}</span>
                                    {domain.autoRenew && (
                                        <>
                                            <span className="text-text-muted">|</span>
                                            <span className="flex items-center gap-1 text-success">
                                                <RefreshCw className="w-3 h-3" />
                                                Renovação automática
                                            </span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredDomains.length === 0 && (
                    <div className="text-center py-12">
                        <Globe className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <p className="text-text-secondary">Nenhum domínio encontrado</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
