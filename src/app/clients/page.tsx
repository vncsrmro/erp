"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Search,
    Filter,
    Phone,
    Mail,
    ChevronRight,
    User
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { ClientModal } from "@/components/modals";
import { getSupabase } from "@/lib/supabase";
import { mockClients } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import type { Client } from "@/lib/database.types";

type FilterStatus = "all" | "active" | "trial" | "overdue" | "inactive";

export default function ClientsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClients = useCallback(async () => {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("clients")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setClients(data || []);
        } catch {
            // Fallback to mock data if not connected
            setClients(mockClients.map(c => ({
                id: c.id,
                user_id: "mock",
                name: c.name,
                email: c.email,
                phone: c.phone || null,
                plan: c.plan,
                plan_value: c.planValue,
                status: c.status,
                payment_status: c.paymentStatus,
                project_status: c.projectStatus,
                tags: c.tags,
                created_at: c.createdAt.toISOString(),
                last_payment: c.lastPayment?.toISOString() || null,
                next_payment: c.nextPayment?.toISOString() || null,
            })));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const filteredClients = clients.filter((client) => {
        const matchesSearch = client.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterStatus === "all" || client.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const statusFilters: { id: FilterStatus; label: string }[] = [
        { id: "all", label: "Todos" },
        { id: "active", label: "Ativos" },
        { id: "trial", label: "Trial" },
        { id: "overdue", label: "Inadimplentes" },
    ];

    const getStatusBadge = (status: string, paymentStatus: string) => {
        if (paymentStatus === "overdue") {
            return { text: "Inadimplente", variant: "danger" as const };
        }
        switch (status) {
            case "active":
                return { text: "Ativo", variant: "success" as const };
            case "trial":
                return { text: "Trial", variant: "primary" as const };
            case "inactive":
                return { text: "Inativo", variant: "warning" as const };
            default:
                return { text: status, variant: "primary" as const };
        }
    };

    const getPlanLabel = (plan: string) => {
        switch (plan) {
            case "starter":
                return "Starter";
            case "professional":
                return "Professional";
            case "enterprise":
                return "Enterprise";
            default:
                return plan;
        }
    };

    return (
        <>
            <AppShell title="Clientes" subtitle={`${clients.length} clientes cadastrados`}>
                <div className="space-y-4 py-4">
                    {/* Search and Add */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar cliente..."
                                icon={Search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button icon={Plus} size="md" onClick={() => setIsModalOpen(true)}>
                            Novo
                        </Button>
                    </div>

                    {/* Status Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setFilterStatus(filter.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                                    filterStatus === filter.id
                                        ? "bg-primary text-white shadow-glow"
                                        : "bg-background-secondary text-text-secondary hover:text-text-primary"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Client List */}
                    <div className="space-y-3">
                        {filteredClients.map((client, index) => {
                            const badge = getStatusBadge(client.status, client.payment_status);
                            return (
                                <motion.div
                                    key={client.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ x: 4 }}
                                    className="card-elevated p-4 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-lg">
                                            {client.name.charAt(0)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-text-primary truncate">
                                                    {client.name}
                                                </h3>
                                                <span className={cn("badge", `badge-${badge.variant}`)}>
                                                    {badge.text}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {client.email}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-xs text-text-secondary">
                                                    {getPlanLabel(client.plan)}
                                                </span>
                                                <span className="text-xs font-semibold text-primary">
                                                    {formatCurrency(client.plan_value)}/mês
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className="w-5 h-5 text-text-muted" />
                                    </div>

                                    {/* Tags */}
                                    {client.tags && client.tags.length > 0 && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                                            {client.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 text-xs bg-background-tertiary text-text-secondary rounded-lg"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredClients.length === 0 && (
                        <div className="text-center py-12">
                            <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <p className="text-text-secondary">Nenhum cliente encontrado</p>
                        </div>
                    )}
                </div>
            </AppShell>

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchClients}
            />
        </>
    );
}

