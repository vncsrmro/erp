"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Lock, Server, Shield, FileText, Eye, EyeOff, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import { encrypt } from "@/lib/vault";
import { cn } from "@/lib/utils";
import type { VaultCredentialInsert, Client } from "@/lib/database.types";

interface CredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const credentialTypes = [
    { id: "password", label: "Senha", icon: Lock, color: "primary" },
    { id: "api_key", label: "API Key", icon: Key, color: "accent" },
    { id: "token", label: "Token", icon: Shield, color: "success" },
    { id: "ssh_key", label: "SSH Key", icon: Server, color: "warning" },
    { id: "other", label: "Outro", icon: FileText, color: "text-secondary" },
];

export function CredentialModal({ isOpen, onClose, onSuccess }: CredentialModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [showValue, setShowValue] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "password",
        clientId: "",
        value: "",
    });

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

            // Encrypt the value before storing
            const encryptedValue = encrypt(formData.value);

            const credentialData: VaultCredentialInsert = {
                user_id: user.id,
                client_id: formData.clientId || null,
                name: formData.name,
                type: formData.type as VaultCredentialInsert['type'],
                encrypted_value: encryptedValue,
            };

            const { error: insertError } = await supabase
                .from("vault_credentials")
                .insert(credentialData as unknown as Record<string, unknown>);

            if (insertError) throw insertError;

            setFormData({
                name: "",
                type: "password",
                clientId: "",
                value: "",
            });
            setShowValue(false);
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar credencial");
        } finally {
            setLoading(false);
        }
    };

    const clientOptions = [
        { value: "", label: "Selecione um cliente (opcional)" },
        ...clients.map(c => ({ value: c.id, label: c.name })),
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nova Credencial"
            subtitle="Armazene credenciais de forma segura"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Security Notice */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30"
                >
                    <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-xs text-primary-light">
                        Credenciais são criptografadas com <span className="font-semibold">AES-256</span>
                    </p>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Type Grid */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                        Tipo de Credencial
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {credentialTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = formData.type === type.id;
                            return (
                                <motion.button
                                    key={type.id}
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                                        isSelected
                                            ? `bg-${type.color}/15 border-${type.color}/50 text-${type.color}`
                                            : "bg-background-tertiary border-border text-text-muted hover:border-primary/30"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">{type.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <Input
                    label="Nome"
                    placeholder="Ex: WordPress Admin"
                    icon={FileText}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                />

                <Select
                    label="Cliente Associado"
                    options={clientOptions}
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                />

                {/* Secure Value Input */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        {formData.type === "ssh_key" ? "Chave SSH" : "Valor"}
                    </label>
                    <div className="relative">
                        {formData.type === "ssh_key" ? (
                            <textarea
                                placeholder="ssh-rsa AAAA..."
                                className="input-field min-h-[100px] font-mono text-sm"
                                value={formData.value}
                                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                                required
                            />
                        ) : (
                            <div className="relative">
                                <input
                                    type={showValue ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    className="input-field pr-12 font-mono"
                                    value={formData.value}
                                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowValue(!showValue)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-primary transition-colors"
                                >
                                    {showValue ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

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
                        icon={Shield}
                    >
                        Salvar no Vault
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
