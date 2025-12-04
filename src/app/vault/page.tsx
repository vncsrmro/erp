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
    Check
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { CredentialModal } from "@/components/modals";
import { getSupabase } from "@/lib/supabase";
import { decrypt } from "@/lib/vault";
import { cn } from "@/lib/utils";
import type { VaultCredential } from "@/lib/database.types";

export default function VaultPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [credentials, setCredentials] = useState<VaultCredential[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCredentials = useCallback(async () => {
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("vault_credentials")
                .select("*")
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

    const getDecryptedValue = (encryptedValue: string) => {
        try {
            return decrypt(encryptedValue);
        } catch {
            return "••••••••";
        }
    };

    const filteredCredentials = credentials.filter((cred) =>
        cred.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                    {/* Search and Add */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar credencial..."
                                icon={Search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                                    {/* Value Display */}
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-background-tertiary">
                                        <code className="flex-1 text-sm font-mono text-text-secondary truncate">
                                            {isVisible
                                                ? getDecryptedValue(credential.encrypted_value)
                                                : "••••••••••••••••"}
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
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCredentials}
            />
        </>
    );
}

