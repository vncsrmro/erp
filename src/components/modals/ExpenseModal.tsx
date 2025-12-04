"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    FileText,
    Calendar,
    RefreshCw,
    Briefcase,
    Server,
    Megaphone,
    Monitor,
    Building,
    MoreHorizontal
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { ExpenseInsert } from "@/lib/database.types";

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const categories = [
    { id: "salaries", label: "Salários", icon: Briefcase, color: "primary" },
    { id: "infrastructure", label: "Infraestrutura", icon: Server, color: "accent" },
    { id: "marketing", label: "Marketing", icon: Megaphone, color: "success" },
    { id: "software", label: "Software", icon: Monitor, color: "warning" },
    { id: "office", label: "Escritório", icon: Building, color: "danger" },
    { id: "other", label: "Outros", icon: MoreHorizontal, color: "text-secondary" },
];

const recurrenceOptions = [
    { value: "", label: "Não recorrente" },
    { value: "monthly", label: "Mensal" },
    { value: "yearly", label: "Anual" },
];

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        category: "other",
        description: "",
        amount: "",
        dueDate: new Date().toISOString().split("T")[0],
        recurrence: "",
    });

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

            const expenseData: ExpenseInsert = {
                user_id: user.id,
                category: formData.category as ExpenseInsert['category'],
                description: formData.description,
                amount: parseFloat(formData.amount),
                due_date: new Date(formData.dueDate).toISOString(),
                is_paid: false,
                is_recurring: !!formData.recurrence,
                recurrence_type: formData.recurrence as "monthly" | "yearly" | null || null,
                paid_date: null,
            };

            const { error: insertError } = await supabase
                .from("expenses")
                .insert(expenseData as unknown as Record<string, unknown>);

            if (insertError) throw insertError;

            setFormData({
                category: "other",
                description: "",
                amount: "",
                dueDate: new Date().toISOString().split("T")[0],
                recurrence: "",
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar despesa");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nova Despesa"
            subtitle="Registre uma nova conta a pagar"
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

                {/* Category Grid */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                        Categoria
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = formData.category === cat.id;
                            return (
                                <motion.button
                                    key={cat.id}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                                        isSelected
                                            ? `bg-${cat.color}/15 border-${cat.color}/50 text-${cat.color}`
                                            : "bg-background-tertiary border-border text-text-muted hover:border-primary/30"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{cat.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <Input
                    label="Descrição"
                    placeholder="Ex: Servidor AWS"
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

                <Select
                    label="Recorrência"
                    options={recurrenceOptions}
                    value={formData.recurrence}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence: e.target.value }))}
                />

                {formData.recurrence && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30 text-warning text-sm"
                    >
                        <RefreshCw className="w-4 h-4 flex-shrink-0" />
                        <span>Esta despesa será registrada automaticamente {formData.recurrence === "monthly" ? "todo mês" : "todo ano"}.</span>
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
                        variant="danger"
                        fullWidth
                        loading={loading}
                    >
                        Salvar Despesa
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
