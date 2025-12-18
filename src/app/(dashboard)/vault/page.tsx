"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Shield,
    Key,
    Eye,
    EyeOff,
    Copy,
    Search,
    Lock,
    User,
    Server,
    Check,
    Trash2,
    Edit,
    Tag
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Input, Select } from "@/components/ui";
import { CredentialModal } from "@/components/modals";
import { getSupabase } from "@/lib/supabase";
import { decrypt } from "@/lib/vault";
import { cn } from "@/lib/utils";
import type { VaultCredential } from "@/lib/database.types";

export default function VaultPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [clientFilter, setClientFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [credentials, setCredentials] = useState<VaultCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCredential, setEditingCredential] = useState<VaultCredential | null>(null);

    const fetchCredentials = useCallback(async () => {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("vault_credentials")
                .select("*, clients(name)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCredentials(data || []);
        } catch {
            // Use empty array as fallback
            setCredentials([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCredentials();
    }, [fetchCredentials]);

    const toggleVisibility = (id: string) => {
        setVisibleIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const copyToClipboard = async (id: string, encryptedValue: string) => {
        try {
            const decryptedValue = decrypt(encryptedValue);
            await navigator.clipboard.writeText(decryptedValue);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta credencial?")) return;

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from("vault_credentials")
                .delete()
                .eq("id", id);

            if (error) throw error;
            fetchCredentials();
        } catch (error) {
            console.error("Failed to delete:", error);
            alert("Erro ao excluir credencial");
        }
    };

    const handleEdit = (credential: VaultCredential) => {
        setEditingCredential(credential);
        setIsModalOpen(true);
    };

    const getDecryptedValue = (encryptedValue: string) => {
        try {
            const decrypted = decrypt(encryptedValue);
            try {
                // Try to parse as JSON for multi-field
                const parsed = JSON.parse(decrypted);
                if (Array.isArray(parsed) && parsed.every(item => 'key' in item && 'value' in item)) {
                    return parsed;
                }
            } catch {
                // Not JSON, return string
            }
            return decrypted;
        } catch {
            return "••••••••";
        }
    };

    const filteredCredentials = credentials.filter((cred) => {
        const matchesSearch = cred.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || cred.type === typeFilter;

        // @ts-ignore
        const clientName = cred.clients?.name || "Sem Cliente";
        const matchesClient = clientFilter === "all" || clientName === clientFilter;

        return matchesSearch && matchesType && matchesClient;
    });

    // Extract unique clients for the filter
    const clientOptions = Array.from(new Set(credentials.map(c => {
        // @ts-ignore
        return c.clients?.name || "Sem Cliente";
    }))).sort().map(name => ({ value: name, label: name }));

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "api_key":
                return Key;
            case "password":
                return Lock;
            case "ssh_key":
                return Server;
            default:
                return Shield;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "api_key":
                return "API Key";
            case "password":
                return "Senha";
            case "ssh_key":
                return "SSH Key";
            case "token":
                return "Token";
            default:
                return type;
        }
    };

    return (
        <>
            <AppShell title="Vault" subtitle="Credenciais seguras">
                <div className="space-y-4 py-4">
                    {/* Security Notice */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30"
                    >
                        <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                        <p className="text-sm text-primary-light">
                            Todas as credenciais são criptografadas com <span className="font-semibold">AES-256</span>
                        </p>
                    </motion.div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar credencial..."
                                icon={Search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select
                                options={[
                                    { value: "all", label: "Todos os Tipos" },
                                    { value: "api_key", label: "API Key" },
                                    { value: "password", label: "Senha" },
                                    { value: "ssh_key", label: "SSH Key" },
                                    { value: "token", label: "Token" },
                                    { value: "other", label: "Outros" },
                                ]}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select
                                options={[
                                    { value: "all", label: "Todos os Clientes" },
                                    ...clientOptions
                                ]}
                                value={clientFilter}
                                onChange={(e) => setClientFilter(e.target.value)}
                            />
                        </div>
                        <Button icon={Plus} size="md" onClick={() => setIsModalOpen(true)}>
                            Nova
                        </Button>
                    </div>

                    {/* Credentials List */}
                    <div className="space-y-3">
                        {filteredCredentials.map((credential, index) => {
                            const TypeIcon = getTypeIcon(credential.type);
                            const isVisible = visibleIds.has(credential.id);
                            const isCopied = copiedId === credential.id;

                            return (
                                <motion.div
                                    key={credential.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="card-elevated p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
                                                <TypeIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-text-primary">
                                                    {credential.name}
                                                </h3>
                                                <span className="badge badge-primary text-xs">
                                                    {getTypeLabel(credential.type)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        {/* Client Tag */}
                                        {/* @ts-ignore - Supabase join type inference issue */}
                                        {credential.clients?.name && (
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-background-tertiary text-xs text-text-secondary border border-border">
                                                <Tag className="w-3 h-3" />
                                                {/* @ts-ignore */}
                                                <span>{credential.clients.name}</span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 ml-auto">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleEdit(credential)}
                                                className="p-2 rounded-lg hover:bg-background-secondary text-text-muted hover:text-primary transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDelete(credential.id)}
                                                className="p-2 rounded-lg hover:bg-background-secondary text-text-muted hover:text-danger transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Value Display */}
                                    <div className="p-3 rounded-lg bg-background-tertiary">
                                        {(() => {
                                            const value = isVisible ? getDecryptedValue(credential.encrypted_value) : null;

                                            if (isVisible && Array.isArray(value)) {
                                                // Multi-field display
                                                return (
                                                    <div className="space-y-2">
                                                        {value.map((field: any, i: number) => (
                                                            <div key={i} className="flex items-center justify-between gap-2 p-2 rounded bg-background-primary/50 border border-border/50">
                                                                <span className="text-xs font-medium text-text-secondary min-w-[80px]">
                                                                    {field.key}:
                                                                </span>
                                                                <code className="flex-1 text-sm font-mono text-text-primary truncate">
                                                                    {field.value}
                                                                </code>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(field.value);
                                                                        setCopiedId(`${credential.id}-${i}`);
                                                                        setTimeout(() => setCopiedId(null), 2000);
                                                                    }}
                                                                    className={cn(
                                                                        "p-1.5 rounded-md transition-colors",
                                                                        copiedId === `${credential.id}-${i}`
                                                                            ? "bg-success/15 text-success"
                                                                            : "hover:bg-background-secondary text-text-muted hover:text-text-primary"
                                                                    )}
                                                                >
                                                                    {copiedId === `${credential.id}-${i}` ? (
                                                                        <Check className="w-3 h-3" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3" />
                                                                    )}
                                                                </motion.button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 text-sm font-mono text-text-secondary truncate">
                                                        {isVisible ? (value as string) : "••••••••••••••••"}
                                                    </code>
                                                    <div className="flex items-center gap-1">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => toggleVisibility(credential.id)}
                                                            className="p-2 rounded-lg hover:bg-background-secondary text-text-muted hover:text-text-primary transition-colors"
                                                        >
                                                            {isVisible ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => copyToClipboard(credential.id, credential.encrypted_value)}
                                                            className={cn(
                                                                "p-2 rounded-lg transition-colors",
                                                                isCopied
                                                                    ? "bg-success/15 text-success"
                                                                    : "hover:bg-background-secondary text-text-muted hover:text-text-primary"
                                                            )}
                                                        >
                                                            {isCopied ? (
                                                                <Check className="w-4 h-4" />
                                                            ) : (
                                                                <Copy className="w-4 h-4" />
                                                            )}
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredCredentials.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Shield className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <p className="text-text-secondary">Nenhuma credencial cadastrada</p>
                            <p className="text-text-muted text-sm mt-2">
                                Adicione suas primeiras credenciais para começar
                            </p>
                        </div>
                    )}
                </div>
            </AppShell>

            <CredentialModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCredential(null);
                }}
                onSuccess={fetchCredentials}
                initialData={editingCredential}
            />
        </>
    );
}
