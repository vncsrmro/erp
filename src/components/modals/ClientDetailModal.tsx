"use client";

import { useState, useEffect } from "react";
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
    AlertTriangle
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import { formatCurrency, cn } from "@/lib/utils";
import type { Client } from "@/lib/database.types";

interface ClientDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onUpdate?: () => void;
    onDelete?: () => void;
}

export function ClientDetailModal({
    isOpen,
    onClose,
    client,
    onUpdate,
    onDelete
}: ClientDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
            setIsEditing(false);
            setShowDeleteConfirm(false);
            setError(null);
        }
    }, [client]);

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

            setIsEditing(false);
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

    if (!client) return null;

    const whatsappLink = getWhatsAppLink(client.phone);
    const daysUntilDue = getDaysUntilDue(client.billing_day || 10);
    const nextDueDate = getNextDueDate(client.billing_day || 10);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Editar Cliente" : client.name}
            subtitle={isEditing ? "Atualize as informações do cliente" : client.plan}
            size="lg"
        >
            <AnimatePresence mode="wait">
                {showDeleteConfirm ? (
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
                                onClick={() => setShowDeleteConfirm(false)}
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
                ) : isEditing ? (
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
                                onClick={() => setIsEditing(false)}
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
                ) : (
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
                                onClick={() => setShowDeleteConfirm(true)}
                                icon={Trash2}
                            >
                                Excluir
                            </Button>
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => setIsEditing(true)}
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
