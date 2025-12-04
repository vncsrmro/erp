"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, User, Calendar, Building, RefreshCw, Shield, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { DomainInsert, Client } from "@/lib/database.types";

interface DomainModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const registrarOptions = [
    { value: "registro.br", label: "Registro.br" },
    { value: "godaddy", label: "GoDaddy" },
    { value: "hostinger", label: "Hostinger" },
    { value: "namecheap", label: "Namecheap" },
    { value: "cloudflare", label: "Cloudflare" },
    { value: "other", label: "Outro" },
];

export function DomainModal({ isOpen, onClose, onSuccess }: DomainModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [formData, setFormData] = useState({
        domain: "",
        clientId: "",
        registrar: "registro.br",
        expirationDate: "",
        autoRenew: false,
        sslExpiration: "",
        notes: "",
    });

    useEffect(() => {
        if (isOpen) {
            fetchClients();
            // Set default expiration to 1 year from now
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            setFormData(prev => ({
                ...prev,
                expirationDate: nextYear.toISOString().split("T")[0],
            }));
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

            const domainData: DomainInsert = {
                user_id: user.id,
                domain: formData.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, ""),
                client_id: formData.clientId || null,
                registrar: formData.registrar,
                expiration_date: new Date(formData.expirationDate).toISOString(),
                auto_renew: formData.autoRenew,
                ssl_expiration: formData.sslExpiration ? new Date(formData.sslExpiration).toISOString() : null,
                notes: formData.notes || null,
            };

            const { error: insertError } = await supabase
                .from("domains")
                .insert(domainData as unknown as Record<string, unknown>);

            if (insertError) throw insertError;

            setFormData({
                domain: "",
                clientId: "",
                registrar: "registro.br",
                expirationDate: "",
                autoRenew: false,
                sslExpiration: "",
                notes: "",
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar domínio");
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
            title="Novo Domínio"
            subtitle="Adicione um domínio para gerenciar"
            size="md"
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
                    label="Domínio"
                    placeholder="exemplo.com.br"
                    icon={Globe}
                    value={formData.domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    required
                />

                <Select
                    label="Cliente"
                    options={clientOptions}
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                />

                <Select
                    label="Registrar"
                    options={registrarOptions}
                    value={formData.registrar}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrar: e.target.value }))}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Data de Expiração"
                        type="date"
                        icon={Calendar}
                        value={formData.expirationDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                        required
                    />
                    <Input
                        label="SSL Expira em"
                        type="date"
                        icon={Shield}
                        value={formData.sslExpiration}
                        onChange={(e) => setFormData(prev => ({ ...prev, sslExpiration: e.target.value }))}
                    />
                </div>

                {/* Auto Renew Toggle */}
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(prev => ({ ...prev, autoRenew: !prev.autoRenew }))}
                    className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                        formData.autoRenew
                            ? "bg-success/10 border-success/50"
                            : "bg-background-tertiary border-border"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <RefreshCw className={cn(
                            "w-5 h-5",
                            formData.autoRenew ? "text-success" : "text-text-muted"
                        )} />
                        <div className="text-left">
                            <p className={cn(
                                "font-medium",
                                formData.autoRenew ? "text-success" : "text-text-primary"
                            )}>
                                Renovação Automática
                            </p>
                            <p className="text-xs text-text-muted">
                                O domínio será renovado automaticamente
                            </p>
                        </div>
                    </div>
                    <div className={cn(
                        "w-12 h-7 rounded-full transition-colors flex items-center p-1",
                        formData.autoRenew ? "bg-success" : "bg-background-secondary"
                    )}>
                        <motion.div
                            layout
                            className={cn(
                                "w-5 h-5 rounded-full bg-white shadow-md",
                                formData.autoRenew && "ml-auto"
                            )}
                        />
                    </div>
                </motion.button>

                <Textarea
                    label="Notas (opcional)"
                    placeholder="Informações adicionais sobre o domínio..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                />

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
                        Salvar Domínio
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
