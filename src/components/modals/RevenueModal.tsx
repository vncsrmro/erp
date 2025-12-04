"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, FileText, Calendar, User, TrendingUp, Repeat, Briefcase } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { RevenueInsert, Client } from "@/lib/database.types";

interface RevenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const typeOptions = [
    { id: "mrr", label: "MRR", description: "Receita Recorrente Mensal", icon: Repeat },
    { id: "one-time", label: "Único", description: "Pagamento único", icon: DollarSign },
    { id: "project", label: "Projeto", description: "Valor de projeto", icon: Briefcase },
];

export function RevenueModal({ isOpen, onClose, onSuccess }: RevenueModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [formData, setFormData] = useState({
        clientId: "",
        description: "",
        amount: "",
        dueDate: new Date().toISOString().split("T")[0],
        type: "mrr",
    });

    // Fetch clients for selection
    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    const fetchClients = async () => {
        const supabase = getSupabase();
        const { data } = await supabase
            .from("clients")
            .select("*")
            .order("name");
        if (data) setClients(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("Você precisa estar logado.");
                return;
            }

            const revenueData: RevenueInsert = {
                user_id: user.id,
                client_id: formData.clientId || null,
                description: formData.description,
                amount: parseFloat(formData.amount),
                due_date: new Date(formData.dueDate).toISOString(),
                is_paid: false,
                type: formData.type as "mrr" | "one-time" | "project",
                paid_date: null,
            };

            const { error: insertError } = await supabase
                .from("revenues")
                .insert(revenueData as unknown as Record<string, unknown>);

            if (insertError) throw insertError;

            setFormData({
                clientId: "",
                description: "",
                amount: "",
                dueDate: new Date().toISOString().split("T")[0],
                type: "mrr",
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar receita");
        } finally {
            setLoading(false);
        }
    };

    const clientOptions = [
        { value: "", label: "Selecione um cliente" },
        ...clients.map(c => ({ value: c.id, label: c.name })),
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nova Receita"
            subtitle="Registre uma nova conta a receber"
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

                {/* Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                        Tipo de Receita
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {typeOptions.map((type) => {
                            const Icon = type.icon;
                            const isSelected = formData.type === type.id;
                            return (
                                <motion.button
                                    key={type.id}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                                        isSelected
                                            ? "bg-success/15 border-success/50 text-success"
                                            : "bg-background-tertiary border-border text-text-muted hover:border-success/30"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{type.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <Select
                    label="Cliente"
                    options={clientOptions}
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                />

                <Input
                    label="Descrição"
                    placeholder="Ex: Mensalidade Plano Professional"
                    icon={FileText}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Valor (R$)"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        icon={DollarSign}
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        required
                    />
                    <Input
                        label="Vencimento"
                        type="date"
                        icon={Calendar}
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        required
                    />
                </div>

                {formData.type === "mrr" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/30 text-success text-sm"
                    >
                        <TrendingUp className="w-4 h-4 flex-shrink-0" />
                        <span>Receita recorrente será contabilizada no MRR.</span>
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
                        className="bg-success hover:bg-success/90"
                    >
                        Salvar Receita
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
