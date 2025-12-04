"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, CreditCard, Tag, Loader2 } from "lucide-react";
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

const planOptions = [
    { value: "starter", label: "Starter - R$ 99/mês" },
    { value: "professional", label: "Professional - R$ 199/mês" },
    { value: "enterprise", label: "Enterprise - R$ 499/mês" },
];

const planValues: Record<string, number> = {
    starter: 99,
    professional: 199,
    enterprise: 499,
};

export function ClientModal({ isOpen, onClose, onSuccess }: ClientModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        plan: "starter",
        tags: "",
    });

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

            const clientData: ClientInsert = {
                user_id: user.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                plan: formData.plan as 'starter' | 'professional' | 'enterprise',
                plan_value: planValues[formData.plan],
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
            setFormData({ name: "", email: "", phone: "", plan: "starter", tags: "" });
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
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Novo Cliente"
            subtitle="Adicione um novo cliente ao sistema"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <Input
                    label="Nome da Empresa"
                    placeholder="Ex: Tech Solutions Ltda"
                    icon={User}
                    value={formData.name}
                    onChange={handleChange("name")}
                    required
                />

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
                    label="Telefone"
                    placeholder="(11) 99999-9999"
                    icon={Phone}
                    value={formData.phone}
                    onChange={handleChange("phone")}
                />

                <Select
                    label="Plano"
                    options={planOptions}
                    value={formData.plan}
                    onChange={handleChange("plan")}
                />

                <Input
                    label="Tags (separadas por vírgula)"
                    placeholder="web, seo, ads"
                    icon={Tag}
                    value={formData.tags}
                    onChange={handleChange("tags")}
                />

                {/* Plan Preview Card */}
                <motion.div
                    layout
                    className="p-4 rounded-xl bg-primary/10 border border-primary/30"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Valor Mensal</span>
                        <span className="text-xl font-bold text-primary">
                            R$ {planValues[formData.plan]},00
                        </span>
                    </div>
                </motion.div>

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
