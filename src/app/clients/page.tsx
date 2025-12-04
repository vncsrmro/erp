"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Search,
    Phone,
    Mail,
    ChevronRight,
    User,
    MessageCircle,
    Building,
    UserCircle,
    Calendar,
    AlertCircle
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { ClientModal, ClientDetailModal } from "@/components/modals";
import { getSupabase } from "@/lib/supabase";
import { mockClients } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import type { Client } from "@/lib/database.types";

type FilterStatus = "all" | "active" | "trial" | "overdue" | "inactive" | "due-soon";

export default function ClientsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
                cnpj: null,
                responsible: null,
                email: c.email,
                phone: c.phone || null,
                plan: c.plan,
                plan_value: c.planValue,
                billing_day: 10,
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

    const getDaysUntilDue = (billingDay: number) => {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let dueDate: Date;
        if (currentDay <= billingDay) {
            dueDate = new Date(currentYear, currentMonth, billingDay);
        } else {
            dueDate = new Date(currentYear, currentMonth + 1, billingDay);
        }

        today.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const filteredClients = clients.filter((client) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            client.name.toLowerCase().includes(searchLower) ||
            client.email.toLowerCase().includes(searchLower) ||
            client.cnpj?.toLowerCase().includes(searchLower) ||
            client.responsible?.toLowerCase().includes(searchLower);

        const daysUntilDue = getDaysUntilDue(client.billing_day || 10);

        let matchesFilter = false;
        switch (filterStatus) {
            case "all":
                matchesFilter = true;
                break;
            case "due-soon":
                matchesFilter = daysUntilDue <= 7 && client.status === "active";
                break;
            case "overdue":
                matchesFilter = client.payment_status === "overdue";
                break;
            default:
                matchesFilter = client.status === filterStatus;
        }

        return matchesSearch && matchesFilter;
    });

    const statusFilters: { id: FilterStatus; label: string; count?: number }[] = [
        { id: "all", label: "Todos" },
        { id: "active", label: "Ativos" },
        { id: "due-soon", label: "Vence em 7 dias", count: clients.filter(c => getDaysUntilDue(c.billing_day || 10) <= 7 && c.status === "active").length },
        { id: "overdue", label: "Inadimplentes", count: clients.filter(c => c.payment_status === "overdue").length },
        { id: "trial", label: "Trial" },
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

    const getWhatsAppLink = (phone: string | null) => {
        if (!phone) return null;
        const cleanPhone = phone.replace(/\D/g, "");
        const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
        return `https://wa.me/${fullPhone}`;
    };

    const handleClientClick = (client: Client) => {
        setSelectedClient(client);
    };

    return (
        <>
            <AppShell title="Clientes" subtitle={`${clients.length} clientes cadastrados`}>
                <div className="space-y-4 py-4">
                    {/* Search and Add */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por nome, e-mail, CNPJ..."
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
                                    "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2",
                                    filterStatus === filter.id
                                        ? "bg-primary text-white shadow-glow"
                                        : "bg-background-secondary text-text-secondary hover:text-text-primary"
                                )}
                            >
                                {filter.label}
                                {filter.count !== undefined && filter.count > 0 && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 text-xs rounded-full",
                                        filterStatus === filter.id
                                            ? "bg-white/20 text-white"
                                            : filter.id === "overdue"
                                                ? "bg-danger/20 text-danger"
                                                : "bg-warning/20 text-warning"
                                    )}>
                                        {filter.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Client List */}
                    <div className="space-y-3">
                        {filteredClients.map((client, index) => {
                            const badge = getStatusBadge(client.status, client.payment_status);
                            const whatsappLink = getWhatsAppLink(client.phone);
                            const daysUntilDue = getDaysUntilDue(client.billing_day || 10);

                            return (
                                <motion.div
                                    key={client.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => handleClientClick(client)}
                                    className="card-elevated p-4 cursor-pointer"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                                            {client.name.charAt(0)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-semibold text-text-primary">
                                                    {client.name}
                                                </h3>
                                                <span className={cn("badge", `badge-${badge.variant}`)}>
                                                    {badge.text}
                                                </span>
                                            </div>

                                            {/* Responsible & CNPJ */}
                                            {(client.responsible || client.cnpj) && (
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary mb-2">
                                                    {client.responsible && (
                                                        <span className="flex items-center gap-1">
                                                            <UserCircle className="w-3.5 h-3.5" />
                                                            {client.responsible}
                                                        </span>
                                                    )}
                                                    {client.cnpj && (
                                                        <span className="flex items-center gap-1 text-text-muted">
                                                            <Building className="w-3.5 h-3.5" />
                                                            {client.cnpj}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Contact */}
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {client.email}
                                                </span>
                                                {client.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {client.phone}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Plan & Value & Due */}
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <span className="text-xs text-text-secondary">
                                                    {client.plan}
                                                </span>
                                                <span className="text-xs font-semibold text-primary">
                                                    {formatCurrency(client.plan_value)}/mês
                                                </span>
                                                <span className={cn(
                                                    "text-xs flex items-center gap-1",
                                                    daysUntilDue <= 3 ? "text-danger" : daysUntilDue <= 7 ? "text-warning" : "text-text-muted"
                                                )}>
                                                    <Calendar className="w-3 h-3" />
                                                    Vence dia {client.billing_day || 10}
                                                    {daysUntilDue <= 7 && (
                                                        <span className="font-medium">
                                                            ({daysUntilDue === 0 ? "hoje" : daysUntilDue < 0 ? "atrasado" : `${daysUntilDue}d`})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {/* WhatsApp Button */}
                                            {whatsappLink && (
                                                <motion.a
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    href={whatsappLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2.5 rounded-xl bg-success/15 text-success hover:bg-success/25 transition-colors"
                                                    title="Enviar mensagem no WhatsApp"
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                </motion.a>
                                            )}
                                            <ChevronRight className="w-5 h-5 text-text-muted" />
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {client.tags && client.tags.length > 0 && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-border flex-wrap">
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

                    {filteredClients.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <p className="text-text-secondary">Nenhum cliente encontrado</p>
                            <p className="text-text-muted text-sm mt-2">
                                Adicione seu primeiro cliente clicando em "Novo"
                            </p>
                        </div>
                    )}
                </div>
            </AppShell>

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchClients}
            />

            <ClientDetailModal
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                client={selectedClient}
                onUpdate={fetchClients}
                onDelete={fetchClients}
            />
        </>
    );
}
