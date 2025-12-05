"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Lock, Server, Shield, FileText, Eye, EyeOff, User, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import { encrypt, decrypt } from "@/lib/vault";
import { cn } from "@/lib/utils";
import type { VaultCredentialInsert, Client, VaultCredential } from "@/lib/database.types";

interface CredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: VaultCredential | null;
}

interface CredentialField {
    key: string;
    value: string;
}

const credentialTypes = [
    { id: "password", label: "Senha", icon: Lock, color: "primary" },
    { id: "api_key", label: "API Key", icon: Key, color: "accent" },
    { id: "token", label: "Token", icon: Shield, color: "success" },
    { id: "ssh_key", label: "SSH Key", icon: Server, color: "warning" },
    { id: "other", label: "Outro", icon: FileText, color: "text-secondary" },
];

export function CredentialModal({ isOpen, onClose, onSuccess, initialData }: CredentialModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [showValue, setShowValue] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "password",
        clientId: "",
        value: "", // Keep for legacy/single value compatibility
    });
    const [fields, setFields] = useState<CredentialField[]>([]);
    const [mode, setMode] = useState<'single' | 'multi'>('single');

    useEffect(() => {
        if (isOpen) {
            fetchClients();
            if (initialData) {
                // Edit Mode
                let decryptedValue = "";
                try {
                    decryptedValue = decrypt(initialData.encrypted_value);
                } catch (e) {
                    console.error("Failed to decrypt for edit", e);
                }

                // Check if it's JSON (multi-field)
                try {
                    const parsed = JSON.parse(decryptedValue);
                    if (Array.isArray(parsed) && parsed.every(item => 'key' in item && 'value' in item)) {
                        setFields(parsed);
                        setMode('multi');
                        setFormData({
                            name: initialData.name,
                            type: initialData.type,
                            clientId: initialData.client_id || "",
                            value: "",
                        });
                    } else {
                        // It's a simple string or not our specific JSON format
                        throw new Error("Not a field array");
                    }
                } catch {
                    // Fallback to single value
                    setMode('single');
                    setFormData({
                        name: initialData.name,
                        type: initialData.type,
                        clientId: initialData.client_id || "",
                        value: decryptedValue,
                    });
                }
            } else {
                // Reset for new entry
                setFormData({
                    name: "",
                    type: "password",
                    clientId: "",
                    value: "",
                });
                setFields([{ key: "", value: "" }]);
                setMode('single');
            }
        }
    }, [isOpen, initialData]);

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

            // Determine final value to encrypt
            let valueToEncrypt = formData.value;
            if (mode === 'multi') {
                // Filter out empty keys
                const validFields = fields.filter(f => f.key.trim() !== "");
                if (validFields.length === 0) {
                    setError("Adicione pelo menos um campo válido.");
                    setLoading(false);
                    return;
                }
                valueToEncrypt = JSON.stringify(validFields);
            } else {
                if (!valueToEncrypt) {
                    setError("O valor é obrigatório.");
                    setLoading(false);
                    return;
                }
            }

            // Encrypt the value before storing
            const encryptedValue = encrypt(valueToEncrypt);

            const credentialData: VaultCredentialInsert = {
                user_id: user.id,
                client_id: formData.clientId || null,
                name: formData.name,
                type: formData.type as VaultCredentialInsert['type'],
                encrypted_value: encryptedValue,
            };

            let query;
            if (initialData) {
                // Update
                query = supabase
                    .from("vault_credentials")
                    .update(credentialData as unknown as Record<string, unknown>)
                    .eq('id', initialData.id);
            } else {
                // Insert
                query = supabase
                    .from("vault_credentials")
                    .insert(credentialData as unknown as Record<string, unknown>);
            }

            const { error: opError } = await query;
            if (opError) throw opError;

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
            title={initialData ? "Editar Credencial" : "Nova Credencial"}
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
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-text-secondary">
                            {formData.type === "ssh_key" ? "Chave SSH" : "Valor / Campos"}
                        </label>
                        <div className="flex bg-background-tertiary rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setMode('single')}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                    mode === 'single' ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                                )}
                            >
                                Único
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('multi')}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                    mode === 'multi' ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                                )}
                            >
                                Múltiplos
                            </button>
                        </div>
                    </div>

                    {mode === 'single' ? (
                        <div className="relative">
                            {formData.type === "ssh_key" ? (
                                <textarea
                                    placeholder="ssh-rsa AAAA..."
                                    className="input-field min-h-[100px] font-mono text-sm"
                                    value={formData.value}
                                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                                />
                            ) : (
                                <div className="relative">
                                    <input
                                        type={showValue ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        className="input-field pr-12 font-mono"
                                        value={formData.value}
                                        onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
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
                    ) : (
                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Chave (ex: Client ID)"
                                        className="input-field w-1/3 text-xs"
                                        value={field.key}
                                        onChange={(e) => {
                                            const newFields = [...fields];
                                            newFields[index].key = e.target.value;
                                            setFields(newFields);
                                        }}
                                    />
                                    <div className="relative flex-1">
                                        <input
                                            type={showValue ? "text" : "password"}
                                            placeholder="Valor"
                                            className="input-field pr-8 text-xs font-mono"
                                            value={field.value}
                                            onChange={(e) => {
                                                const newFields = [...fields];
                                                newFields[index].value = e.target.value;
                                                setFields(newFields);
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newFields = fields.filter((_, i) => i !== index);
                                            setFields(newFields);
                                        }}
                                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    icon={Plus}
                                    onClick={() => setFields([...fields, { key: "", value: "" }])}
                                >
                                    Adicionar Campo
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setShowValue(!showValue)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {showValue ? "Ocultar Valores" : "Mostrar Valores"}
                                </button>
                            </div>
                        </div>
                    )}
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
