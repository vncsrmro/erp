"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, CreditCard, Tag, Loader2, Building, UserCircle, DollarSign } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import type { ClientInsert } from "@/lib/database.types";

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function ClientModal({ isOpen, onClose, onSuccess }: ClientModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        cnpj: "",
        responsible: "",
        email: "",
        phone: "",
        planName: "",
        planValue: "",
        billingDay: "10",
        tags: "",
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("Você precisa estar logado para adicionar clientes.");
                return;
            }

            const planValue = parseFloat(formData.planValue.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

            const billingDay = parseInt(formData.billingDay) || 10;

            const clientData: ClientInsert = {
                user_id: user.id,
                name: formData.name,
                cnpj: formData.cnpj || null,
                responsible: formData.responsible || null,
                email: formData.email,
                phone: formData.phone.replace(/\D/g, "") || null,
                plan: formData.planName || "Personalizado",
                plan_value: planValue,
                billing_day: billingDay,
                status: "active",
                payment_status: "pending",
                project_status: "active",
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
                last_payment: null,
                next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            };

            const { error: insertError } = await supabase
                .from("clients")
                .insert(clientData as unknown as Record<string, unknown>);

            if (insertError) throw insertError;

            // Reset form and close
            setFormData({
                name: "",
                cnpj: "",
                responsible: "",
                email: "",
                phone: "",
                planName: "",
                planValue: "",
                billingDay: "10",
                tags: "",
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar cliente");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        let value = e.target.value;

        // Format CNPJ
        if (field === "cnpj") {
            value = formatCNPJ(value);
        }

        // Format phone
        if (field === "phone") {
            value = formatPhone(value);
        }

        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const planValue = parseFloat(formData.planValue.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Novo Cliente"
            subtitle="Adicione um novo cliente ao sistema"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Company Info Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Dados da Empresa
                    </h3>

                    <Input
                        label="Nome da Empresa"
                        placeholder="Ex: Tech Solutions Ltda"
                        icon={Building}
                        value={formData.name}
                        onChange={handleChange("name")}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="CNPJ"
                            placeholder="00.000.000/0000-00"
                            value={formData.cnpj}
                            onChange={handleChange("cnpj")}
                        />

                        <Input
                            label="Responsável"
                            placeholder="Nome do responsável"
                            icon={UserCircle}
                            value={formData.responsible}
                            onChange={handleChange("responsible")}
                        />
                    </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contato
                    </h3>

                    <Input
                        label="E-mail"
                        type="email"
                        placeholder="contato@empresa.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange("email")}
                        required
                    />

                    <Input
                        label="WhatsApp"
                        placeholder="(11) 99999-9999"
                        icon={Phone}
                        value={formData.phone}
                        onChange={handleChange("phone")}
                    />
                </div>

                {/* Plan Section */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Plano
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Nome do Plano"
                            placeholder="Ex: Starter, Personalizado"
                            value={formData.planName}
                            onChange={handleChange("planName")}
                        />

                        <Input
                            label="Valor Mensal (R$)"
                            placeholder="0,00"
                            icon={DollarSign}
                            value={formData.planValue}
                            onChange={handleChange("planValue")}
                            required
                        />

                        <Input
                            label="Dia Vencimento"
                            placeholder="10"
                            type="number"
                            min="1"
                            max="31"
                            value={formData.billingDay}
                            onChange={handleChange("billingDay")}
                        />
                    </div>
                </div>

                {/* Tags */}
                <Input
                    label="Tags (separadas por vírgula)"
                    placeholder="web, seo, ads"
                    icon={Tag}
                    value={formData.tags}
                    onChange={handleChange("tags")}
                />

                {/* Plan Preview Card */}
                {planValue > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl bg-primary/10 border border-primary/30"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm text-text-secondary">Plano</span>
                                <p className="font-medium text-text-primary">
                                    {formData.planName || "Personalizado"}
                                </p>
                            </div>
                            <span className="text-xl font-bold text-primary">
                                R$ {planValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
                            </span>
                        </div>
                    </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        fullWidth
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={loading}
                    >
                        Salvar Cliente
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

