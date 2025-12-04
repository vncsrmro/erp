"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    CreditCard,
    Tag,
    Building,
    UserCircle,
    DollarSign,
    Calendar,
    MessageCircle,
    Pencil,
    Trash2,
    X,
    Save,
    AlertTriangle,
    Globe,
    Plus,
    ExternalLink
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Client, Domain } from "@/lib/database.types";

interface ClientDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onUpdate?: () => void;
    onDelete?: () => void;
}

type ViewMode = "details" | "edit" | "delete" | "add-domain" | "edit-domain";

export function ClientDetailModal({
    isOpen,
    onClose,
    client,
    onUpdate,
    onDelete
}: ClientDetailModalProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("details");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [editingDomain, setEditingDomain] = useState<Domain | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        cnpj: "",
        responsible: "",
        email: "",
        phone: "",
        plan: "",
        plan_value: "",
        billing_day: "10",
        tags: "",
        status: "active" as Client["status"],
        payment_status: "pending" as Client["payment_status"],
    });

    const [domainForm, setDomainForm] = useState({
        domain: "",
        registrar: "",
        expiration_date: "",
        auto_renew: true,
        notes: "",
    });

    const fetchDomains = useCallback(async () => {
        if (!client) return;
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("domains")
                .select("*")
                .eq("client_id", client.id)
                .order("expiration_date");

            if (error) throw error;
            setDomains(data || []);
        } catch {
            setDomains([]);
        }
    }, [client]);

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name,
                cnpj: client.cnpj || "",
                responsible: client.responsible || "",
                email: client.email,
                phone: client.phone || "",
                plan: client.plan,
                plan_value: client.plan_value.toString(),
                billing_day: client.billing_day?.toString() || "10",
                tags: client.tags?.join(", ") || "",
                status: client.status,
                payment_status: client.payment_status,
            });
            setViewMode("details");
            setError(null);
            fetchDomains();
        }
    }, [client, fetchDomains]);

    const formatCNPJ = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 14) {
            return numbers
                .replace(/(\d{2})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1/$2")
                .replace(/(\d{4})(\d)/, "$1-$2");
        }
        return value.slice(0, 18);
    };

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            if (numbers.length <= 10) {
                return numbers
                    .replace(/(\d{2})(\d)/, "($1) $2")
                    .replace(/(\d{4})(\d)/, "$1-$2");
            }
            return numbers
                .replace(/(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2");
        }
        return value.slice(0, 15);
    };

    const handleChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        let value = e.target.value;

        if (field === "cnpj") value = formatCNPJ(value);
        if (field === "phone") value = formatPhone(value);

        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!client) return;
        setLoading(true);
        setError(null);

        try {
            const supabase = getSupabase();
            const planValue = parseFloat(formData.plan_value.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
            const billingDay = parseInt(formData.billing_day) || 10;

            const { error: updateError } = await supabase
                .from("clients")
                .update({
                    name: formData.name,
                    cnpj: formData.cnpj || null,
                    responsible: formData.responsible || null,
                    email: formData.email,
                    phone: formData.phone.replace(/\D/g, "") || null,
                    plan: formData.plan || "Personalizado",
                    plan_value: planValue,
                    billing_day: billingDay,
                    tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
                    status: formData.status,
                    payment_status: formData.payment_status,
                })
                .eq("id", client.id);

            if (updateError) throw updateError;

            setViewMode("details");
            onUpdate?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao atualizar cliente");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!client) return;
        setLoading(true);
        setError(null);

        try {
            const supabase = getSupabase();
            const { error: deleteError } = await supabase
                .from("clients")
                .delete()
                .eq("id", client.id);

            if (deleteError) throw deleteError;

            onDelete?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao excluir cliente");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDomain = () => {
        setDomainForm({
            domain: "",
            registrar: "",
            expiration_date: "",
            auto_renew: true,
            notes: "",
        });
        setEditingDomain(null);
        setViewMode("add-domain");
    };

    const handleEditDomain = (domain: Domain) => {
        setDomainForm({
            domain: domain.domain,
            registrar: domain.registrar || "",
            expiration_date: domain.expiration_date.split("T")[0],
            auto_renew: domain.auto_renew,
            notes: domain.notes || "",
        });
        setEditingDomain(domain);
        setViewMode("edit-domain");
    };

    const handleSaveDomain = async () => {
        if (!client) return;
        setLoading(true);
        setError(null);

        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Não autenticado");

            if (editingDomain) {
                const { error } = await supabase
                    .from("domains")
                    .update({
                        domain: domainForm.domain,
                        registrar: domainForm.registrar || null,
                        expiration_date: domainForm.expiration_date,
                        auto_renew: domainForm.auto_renew,
                        notes: domainForm.notes || null,
                    })
                    .eq("id", editingDomain.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("domains")
                    .insert({
                        user_id: user.id,
                        client_id: client.id,
                        domain: domainForm.domain,
                        registrar: domainForm.registrar || null,
                        expiration_date: domainForm.expiration_date,
                        auto_renew: domainForm.auto_renew,
                        notes: domainForm.notes || null,
                        status: "active",
                    });
                if (error) throw error;
            }

            setViewMode("details");
            fetchDomains();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar domínio");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDomain = async (domainId: string) => {
        try {
            const supabase = getSupabase();
            await supabase.from("domains").delete().eq("id", domainId);
            fetchDomains();
        } catch (err) {
            console.error("Error deleting domain:", err);
        }
    };

    const getWhatsAppLink = (phone: string | null) => {
        if (!phone) return null;
        const cleanPhone = phone.replace(/\D/g, "");
        const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
        return `https://wa.me/${fullPhone}`;
    };

    const getNextDueDate = (billingDay: number) => {
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

        return dueDate;
    };

    const getDaysUntilDue = (billingDay: number) => {
        const dueDate = getNextDueDate(billingDay);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getDaysUntilExpiration = (date: string) => {
        const expDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = expDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (!client) return null;

    const whatsappLink = getWhatsAppLink(client.phone);
    const daysUntilDue = getDaysUntilDue(client.billing_day || 10);

    const getModalTitle = () => {
        switch (viewMode) {
            case "edit": return "Editar Cliente";
            case "delete": return "Excluir Cliente";
            case "add-domain": return "Novo Domínio";
            case "edit-domain": return "Editar Domínio";
            default: return client.name;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getModalTitle()}
            subtitle={viewMode === "details" ? client.plan : undefined}
            size="lg"
        >
            <AnimatePresence mode="wait">
                {/* Delete Confirmation */}
                {viewMode === "delete" && (
                    <motion.div
                        key="delete-confirm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        <div className="p-4 rounded-xl bg-danger/10 border border-danger/30">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-danger">Confirmar Exclusão</h4>
                                    <p className="text-sm text-danger/80 mt-1">
                                        Tem certeza que deseja excluir <strong>{client.name}</strong>?
                                        Esta ação não pode ser desfeita.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => setViewMode("details")}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="danger"
                                fullWidth
                                onClick={handleDelete}
                                loading={loading}
                                icon={Trash2}
                            >
                                Excluir
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Edit Client Form */}
                {viewMode === "edit" && (
                    <motion.form
                        key="edit-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                        onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                    >
                        {error && (
                            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Nome da Empresa"
                            icon={Building}
                            value={formData.name}
                            onChange={handleChange("name")}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="CNPJ"
                                value={formData.cnpj}
                                onChange={handleChange("cnpj")}
                            />
                            <Input
                                label="Responsável"
                                icon={UserCircle}
                                value={formData.responsible}
                                onChange={handleChange("responsible")}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="E-mail"
                                type="email"
                                icon={Mail}
                                value={formData.email}
                                onChange={handleChange("email")}
                                required
                            />
                            <Input
                                label="WhatsApp"
                                icon={Phone}
                                value={formData.phone}
                                onChange={handleChange("phone")}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Plano"
                                value={formData.plan}
                                onChange={handleChange("plan")}
                            />
                            <Input
                                label="Valor (R$)"
                                icon={DollarSign}
                                value={formData.plan_value}
                                onChange={handleChange("plan_value")}
                                required
                            />
                            <Input
                                label="Dia Vencimento"
                                icon={Calendar}
                                type="number"
                                min="1"
                                max="31"
                                value={formData.billing_day}
                                onChange={handleChange("billing_day")}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={handleChange("status")}
                                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="active">Ativo</option>
                                    <option value="trial">Trial</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Pagamento
                                </label>
                                <select
                                    value={formData.payment_status}
                                    onChange={handleChange("payment_status")}
                                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="paid">Pago</option>
                                    <option value="pending">Pendente</option>
                                    <option value="overdue">Atrasado</option>
                                </select>
                            </div>
                        </div>

                        <Input
                            label="Tags (separadas por vírgula)"
                            icon={Tag}
                            value={formData.tags}
                            onChange={handleChange("tags")}
                        />

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                fullWidth
                                onClick={() => setViewMode("details")}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={loading}
                                icon={Save}
                            >
                                Salvar
                            </Button>
                        </div>
                    </motion.form>
                )}

                {/* Add/Edit Domain Form */}
                {(viewMode === "add-domain" || viewMode === "edit-domain") && (
                    <motion.form
                        key="domain-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                        onSubmit={(e) => { e.preventDefault(); handleSaveDomain(); }}
                    >
                        {error && (
                            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Domínio"
                            icon={Globe}
                            placeholder="exemplo.com.br"
                            value={domainForm.domain}
                            onChange={(e) => setDomainForm(prev => ({ ...prev, domain: e.target.value }))}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Registrador"
                                placeholder="Ex: Registro.br, GoDaddy"
                                value={domainForm.registrar}
                                onChange={(e) => setDomainForm(prev => ({ ...prev, registrar: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Data de Expiração"
                                type="date"
                                icon={Calendar}
                                value={domainForm.expiration_date}
                                onChange={(e) => setDomainForm(prev => ({ ...prev, expiration_date: e.target.value }))}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Renovação
                                </label>
                                <select
                                    value={domainForm.auto_renew ? "true" : "false"}
                                    onChange={(e) => setDomainForm(prev => ({ ...prev, auto_renew: e.target.value === "true" }))}
                                    className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-border text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="true">Automática</option>
                                    <option value="false">Manual</option>
                                </select>
                            </div>
                        </div>

                        <Input
                            label="Observações"
                            placeholder="Notas sobre o domínio..."
                            value={domainForm.notes}
                            onChange={(e) => setDomainForm(prev => ({ ...prev, notes: e.target.value }))}
                        />

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                fullWidth
                                onClick={() => setViewMode("details")}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={loading}
                                icon={Save}
                            >
                                {editingDomain ? "Salvar" : "Adicionar"}
                            </Button>
                        </div>
                    </motion.form>
                )}

                {/* View Details */}
                {viewMode === "details" && (
                    <motion.div
                        key="view-details"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {/* Status badges */}
                        <div className="flex flex-wrap gap-2">
                            <span className={cn(
                                "badge",
                                client.status === "active" && "badge-success",
                                client.status === "trial" && "badge-primary",
                                client.status === "inactive" && "badge-warning"
                            )}>
                                {client.status === "active" ? "Ativo" : client.status === "trial" ? "Trial" : "Inativo"}
                            </span>
                            <span className={cn(
                                "badge",
                                client.payment_status === "paid" && "badge-success",
                                client.payment_status === "pending" && "badge-warning",
                                client.payment_status === "overdue" && "badge-danger"
                            )}>
                                {client.payment_status === "paid" ? "Pago" : client.payment_status === "pending" ? "Pendente" : "Atrasado"}
                            </span>
                        </div>

                        {/* Company info */}
                        <div className="space-y-3">
                            {client.cnpj && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-background-secondary">
                                    <Building className="w-5 h-5 text-text-muted" />
                                    <div>
                                        <p className="text-xs text-text-muted">CNPJ</p>
                                        <p className="text-text-primary font-medium">{client.cnpj}</p>
                                    </div>
                                </div>
                            )}

                            {client.responsible && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-background-secondary">
                                    <UserCircle className="w-5 h-5 text-text-muted" />
                                    <div>
                                        <p className="text-xs text-text-muted">Responsável</p>
                                        <p className="text-text-primary font-medium">{client.responsible}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background-secondary">
                                <Mail className="w-5 h-5 text-text-muted" />
                                <div>
                                    <p className="text-xs text-text-muted">E-mail</p>
                                    <p className="text-text-primary font-medium">{client.email}</p>
                                </div>
                            </div>

                            {client.phone && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-background-secondary">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-text-muted" />
                                        <div>
                                            <p className="text-xs text-text-muted">WhatsApp</p>
                                            <p className="text-text-primary font-medium">{client.phone}</p>
                                        </div>
                                    </div>
                                    {whatsappLink && (
                                        <a
                                            href={whatsappLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 rounded-xl bg-success/15 text-success hover:bg-success/25 transition-colors"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Plan & Billing */}
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs text-text-muted">Plano</p>
                                    <p className="font-semibold text-text-primary">{client.plan}</p>
                                </div>
                                <span className="text-2xl font-bold text-primary">
                                    {formatCurrency(client.plan_value)}
                                    <span className="text-sm font-normal text-text-muted">/mês</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-primary/20">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Calendar className="w-4 h-4" />
                                    <span>Vencimento dia {client.billing_day || 10}</span>
                                </div>
                                <span className={cn(
                                    "text-sm font-medium",
                                    daysUntilDue <= 3 ? "text-danger" : daysUntilDue <= 7 ? "text-warning" : "text-success"
                                )}>
                                    {daysUntilDue === 0 ? "Vence hoje" : daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} dias atrasado` : `${daysUntilDue} dias`}
                                </span>
                            </div>
                        </div>

                        {/* Domains */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-text-primary flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-text-muted" />
                                    Domínios
                                </h4>
                                <Button size="sm" variant="secondary" icon={Plus} onClick={handleAddDomain}>
                                    Adicionar
                                </Button>
                            </div>

                            {domains.length === 0 ? (
                                <p className="text-sm text-text-muted py-4 text-center">
                                    Nenhum domínio cadastrado
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {domains.map(domain => {
                                        const daysToExpire = getDaysUntilExpiration(domain.expiration_date);
                                        return (
                                            <div
                                                key={domain.id}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-xl border",
                                                    daysToExpire <= 30
                                                        ? "bg-warning/5 border-warning/20"
                                                        : "bg-background-secondary border-border"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                                        daysToExpire <= 30 ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
                                                    )}>
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-text-primary text-sm">{domain.domain}</p>
                                                        <p className="text-xs text-text-muted">
                                                            Expira: {formatDate(new Date(domain.expiration_date))}
                                                            {daysToExpire <= 30 && (
                                                                <span className="text-warning ml-1">({daysToExpire}d)</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <a
                                                        href={`https://${domain.domain}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg hover:bg-background-tertiary text-text-muted hover:text-primary transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleEditDomain(domain)}
                                                        className="p-2 rounded-lg hover:bg-background-tertiary text-text-muted hover:text-primary transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDomain(domain.id)}
                                                        className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {client.tags && client.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {client.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1.5 text-sm bg-background-secondary text-text-secondary rounded-lg"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="danger"
                                onClick={() => setViewMode("delete")}
                                icon={Trash2}
                            >
                                Excluir
                            </Button>
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => setViewMode("edit")}
                                icon={Pencil}
                            >
                                Editar
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
}
