"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Globe,
    Calendar,
    AlertTriangle,
    ExternalLink,
    RefreshCw,
    Search
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { DomainModal } from "@/components/modals";
import { getSupabase } from "@/lib/supabase";
import { mockDomains } from "@/lib/mock-data";
import { formatDate, daysUntil, getUrgencyLevel, cn } from "@/lib/utils";
import type { Domain } from "@/lib/database.types";

export default function DomainsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDomains = useCallback(async () => {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("domains")
                .select("*")
                .order("expiration_date");

            if (error) throw error;
            setDomains(data || []);
        } catch {
            // Fallback to mock data
            setDomains(mockDomains.map(d => ({
                id: d.id,
                user_id: "mock",
                client_id: d.clientId,
                domain: d.domain,
                registrar: d.registrar,
                expiration_date: d.expirationDate.toISOString(),
                auto_renew: d.autoRenew,
                ssl_expiration: d.sslExpiration?.toISOString() || null,
                notes: null,
                created_at: new Date().toISOString(),
            })));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    const domainsWithDays = domains
        .map((domain) => ({
            ...domain,
            daysRemaining: daysUntil(new Date(domain.expiration_date)),
        }))
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const filteredDomains = domainsWithDays.filter((domain) =>
        domain.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const urgentCount = domainsWithDays.filter((d) => d.daysRemaining <= 30).length;

    return (
        <>
            <AppShell title="Domínios" subtitle={`${domains.length} domínios gerenciados`}>
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
                        <Button icon={Plus} size="md" onClick={() => setIsModalOpen(true)}>
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
                                                <p className="text-sm text-text-muted">{domain.registrar}</p>
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
                                            Vence: {formatDate(new Date(domain.expiration_date))}
                                        </span>
                                        {domain.auto_renew && (
                                            <>
                                                <span className="text-text-muted">|</span>
                                                <span className="flex items-center gap-1 text-success">
                                                    <RefreshCw className="w-3 h-3" />
                                                    Auto-renovação
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredDomains.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Globe className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <p className="text-text-secondary">Nenhum domínio encontrado</p>
                        </div>
                    )}
                </div>
            </AppShell>

            <DomainModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchDomains}
            />
        </>
    );
}

