"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Phone, CreditCard, Tag, Building, UserCircle, DollarSign,
    Smartphone, Globe, Database, Users, Link as LinkIcon, Calendar
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import type { ClientInsert } from "@/lib/database.types";
import { cn } from "@/lib/utils";

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type Category = "inovasys" | "paperx";

export function ClientModal({ isOpen, onClose, onSuccess }: ClientModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<Category>("inovasys");
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
        // PaperX specific
        slug: "",
        userLimit: "",
        setupFee: "",
        customDomain: "",
        trialDays: "",
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

    const formatSlug = (value: string) => {
        return value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
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
            const setupFee = parseFloat(formData.setupFee.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
            const userLimit = parseInt(formData.userLimit) || 0;
            const trialDays = parseInt(formData.trialDays) || 0;

            const trialEndsAt = trialDays > 0
                ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
                : null;

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
                status: trialDays > 0 ? "trial" : "active",
                payment_status: "pending",
                project_status: "active",
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
                last_payment: null,
                next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                // New PaperX fields
                category,
                slug: category === "paperx" ? formData.slug || null : null,
                user_limit: category === "paperx" ? userLimit : 0,
                storage_used_gb: 0,
                custom_domain: category === "paperx" ? formData.customDomain || null : null,
                logo_url: null,
                favicon_url: null,
                whatsapp_api_key: null,
                supabase_project_id: null,
                setup_fee: category === "paperx" ? setupFee : 0,
                notes: null,
                trial_ends_at: trialEndsAt,
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
                slug: "",
                userLimit: "",
                setupFee: "",
                customDomain: "",
                trialDays: "",
            });
            setCategory("inovasys");
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

        if (field === "cnpj") {
            value = formatCNPJ(value);
        }

        if (field === "phone") {
            value = formatPhone(value);
        }

        if (field === "slug") {
            value = formatSlug(value);
        }

        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const planValue = parseFloat(formData.planValue.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

    // PaperX plans
    const paperxPlans = [
        { name: "Essencial", value: 147, users: 3, setup: 597 },
        { name: "Profissional", value: 397, users: 8, setup: 897 },
        { name: "Enterprise", value: 0, users: 0, setup: 0 },
    ];

    const selectPaperxPlan = (plan: typeof paperxPlans[0]) => {
        setFormData(prev => ({
            ...prev,
            planName: plan.name,
            planValue: plan.value > 0 ? plan.value.toString() : "",
            userLimit: plan.users > 0 ? plan.users.toString() : "",
            setupFee: plan.setup > 0 ? plan.setup.toString() : "",
        }));
    };

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

                {/* Category Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Categoria</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setCategory("inovasys")}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all text-left",
                                category === "inovasys"
                                    ? "border-blue-500 bg-blue-500/10"
                                    : "border-border hover:border-blue-500/50 bg-background-secondary"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    category === "inovasys" ? "bg-blue-500/20" : "bg-background-tertiary"
                                )}>
                                    <Building className={cn(
                                        "w-5 h-5",
                                        category === "inovasys" ? "text-blue-400" : "text-text-muted"
                                    )} />
                                </div>
                                <div>
                                    <p className={cn(
                                        "font-semibold",
                                        category === "inovasys" ? "text-blue-400" : "text-text-primary"
                                    )}>InovaSys</p>
                                    <p className="text-xs text-text-muted">Sites, Lojas, Sistemas</p>
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setCategory("paperx")}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all text-left",
                                category === "paperx"
                                    ? "border-emerald-500 bg-emerald-500/10"
                                    : "border-border hover:border-emerald-500/50 bg-background-secondary"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    category === "paperx" ? "bg-emerald-500/20" : "bg-background-tertiary"
                                )}>
                                    <Smartphone className={cn(
                                        "w-5 h-5",
                                        category === "paperx" ? "text-emerald-400" : "text-text-muted"
                                    )} />
                                </div>
                                <div>
                                    <p className={cn(
                                        "font-semibold",
                                        category === "paperx" ? "text-emerald-400" : "text-text-primary"
                                    )}>PaperX</p>
                                    <p className="text-xs text-text-muted">SaaS Multi-Tenant</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

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

                {/* PaperX Quick Plans */}
                <AnimatePresence>
                    {category === "paperx" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 pt-2 overflow-hidden"
                        >
                            <h3 className="text-sm font-medium text-text-secondary">Planos PaperX</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {paperxPlans.map(plan => (
                                    <button
                                        key={plan.name}
                                        type="button"
                                        onClick={() => selectPaperxPlan(plan)}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all text-center",
                                            formData.planName === plan.name
                                                ? "border-emerald-500 bg-emerald-500/10"
                                                : "border-border bg-background-secondary hover:border-emerald-500/50"
                                        )}
                                    >
                                        <p className="font-semibold text-sm text-text-primary">{plan.name}</p>
                                        <p className="text-xs text-text-muted">
                                            {plan.value > 0 ? `R$ ${plan.value}/mês` : "Sob consulta"}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                {/* PaperX Specific Fields */}
                <AnimatePresence>
                    {category === "paperx" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-2 overflow-hidden"
                        >
                            <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                Configuração Tenant
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Slug (subdomínio)"
                                    placeholder="nome-empresa"
                                    icon={LinkIcon}
                                    value={formData.slug}
                                    onChange={handleChange("slug")}
                                />

                                <Input
                                    label="Limite de Usuários"
                                    placeholder="3"
                                    type="number"
                                    icon={Users}
                                    value={formData.userLimit}
                                    onChange={handleChange("userLimit")}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Taxa de Setup (R$)"
                                    placeholder="597,00"
                                    icon={DollarSign}
                                    value={formData.setupFee}
                                    onChange={handleChange("setupFee")}
                                />

                                <Input
                                    label="Domínio Customizado"
                                    placeholder="app.cliente.com"
                                    icon={Globe}
                                    value={formData.customDomain}
                                    onChange={handleChange("customDomain")}
                                />

                                <Input
                                    label="Dias de Trial"
                                    placeholder="14"
                                    type="number"
                                    icon={Calendar}
                                    value={formData.trialDays}
                                    onChange={handleChange("trialDays")}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                        className={cn(
                            "p-4 rounded-xl border",
                            category === "paperx"
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-primary/10 border-primary/30"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm text-text-secondary">
                                    {category === "paperx" ? "Tenant PaperX" : "Cliente InovaSys"}
                                </span>
                                <p className="font-medium text-text-primary">
                                    {formData.planName || "Personalizado"}
                                </p>
                            </div>
                            <span className={cn(
                                "text-xl font-bold",
                                category === "paperx" ? "text-emerald-400" : "text-primary"
                            )}>
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
