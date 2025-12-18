"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
    Globe,
    Calendar,
    AlertTriangle,
    ExternalLink,
    RefreshCw,
    Search,
    User,
    ArrowRight
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { ClientDetailModal } from "@/components/modals";
import { getSupabase } from "@/lib/supabase";
import { formatDate, daysUntil, getUrgencyLevel, cn } from "@/lib/utils";
import type { Domain, Client } from "@/lib/database.types";
import Link from "next/link";

export default function DomainsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [domains, setDomains] = useState<Domain[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    // Client Modal State
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const supabase = getSupabase();
            const [domainsRes, clientsRes] = await Promise.all([
                supabase.from("domains").select("*").order("expiration_date"),
                supabase.from("clients").select("*")
            ]);

            setDomains(domainsRes.data || []);
            setClients(clientsRes.data || []);
        } catch {
            console.error("Error fetching domains");
            setDomains([]);
            setClients([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDomainClick = (domain: Domain) => {
        if (!domain.client_id) return;
        const client = clients.find(c => c.id === domain.client_id);
        if (client) {
            setSelectedClient(client);
            setIsClientModalOpen(true);
        }
    };

    const domainsWithDays = domains
        .map((domain) => ({
            ...domain,
            daysRemaining: daysUntil(new Date(domain.expiration_date)),
            clientName: clients.find(c => c.id === domain.client_id)?.name
        }))
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const filteredDomains = domainsWithDays.filter((domain) =>
        domain.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        domain.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
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

                    {/* Search and Actions */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por domínio ou cliente..."
                                icon={Search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Link href="/clients">
                            <Button variant="secondary" icon={ArrowRight}>
                                Gerenciar nos Clientes
                            </Button>
                        </Link>
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
                                    onClick={() => handleDomainClick(domain)}
                                    className={cn(
                                        "card-elevated p-4 cursor-pointer hover:border-primary/50 transition-all group",
                                        urgency === "critical" && "border-danger/50",
                                        urgency === "warning" && "border-warning/50"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "p-2.5 rounded-xl transition-colors",
                                                    urgency === "critical" && "bg-danger/15 text-danger",
                                                    urgency === "warning" && "bg-warning/15 text-warning",
                                                    urgency === "normal" && "bg-primary/15 text-primary group-hover:bg-primary/20"
                                                )}
                                            >
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                                                        {domain.domain}
                                                    </h3>
                                                    <a
                                                        href={`https://${domain.domain}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-text-muted hover:text-primary transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                                    <span>{domain.registrar}</span>
                                                    {domain.clientName && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1 text-text-secondary">
                                                                <User className="w-3 h-3" />
                                                                {domain.clientName}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
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

            <ClientDetailModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                client={selectedClient}
                onUpdate={fetchData}
                onDelete={fetchData}
            />
        </>
    );
}
