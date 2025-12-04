"use client";

import { motion } from "framer-motion";
import { useState } from "react";
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
    Globe,
    Server
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

// Mock vault credentials
const mockCredentials = [
    {
        id: "1",
        clientId: "1",
        clientName: "Tech Solutions Ltda",
        type: "api_key" as const,
        name: "Google Analytics API",
        maskedValue: "UA-****-****-1234",
    },
    {
        id: "2",
        clientId: "1",
        clientName: "Tech Solutions Ltda",
        type: "password" as const,
        name: "WordPress Admin",
        maskedValue: "••••••••••••",
    },
    {
        id: "3",
        clientId: "2",
        clientName: "Advocacia Mendes",
        type: "password" as const,
        name: "Hosting cPanel",
        maskedValue: "••••••••••••",
    },
    {
        id: "4",
        clientId: "3",
        clientName: "Clínica Saúde Plena",
        type: "token" as const,
        name: "Stripe API Key",
        maskedValue: "sk_live_****...****48Fj",
    },
    {
        id: "5",
        clientId: "3",
        clientName: "Clínica Saúde Plena",
        type: "ssh_key" as const,
        name: "VPS SSH Key",
        maskedValue: "ssh-rsa AAAA...XXXX",
    },
];

type CredentialType = "api_key" | "password" | "ssh_key" | "token" | "other";

export default function VaultPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleIds, setVisibleIds] = useState<string[]>([]);

    const toggleVisibility = (id: string) => {
        setVisibleIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // In production, show a toast notification
    };

    const filteredCredentials = mockCredentials.filter(
        (cred) =>
            cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cred.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTypeIcon = (type: CredentialType) => {
        switch (type) {
            case "api_key":
                return Key;
            case "password":
                return Lock;
            case "ssh_key":
                return Server;
            case "token":
                return Shield;
            default:
                return Key;
        }
    };

    const getTypeLabel = (type: CredentialType) => {
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
                    <Button icon={Plus} size="md">
                        Nova
                    </Button>
                </div>

                {/* Credentials List */}
                <div className="space-y-3">
                    {filteredCredentials.map((credential, index) => {
                        const TypeIcon = getTypeIcon(credential.type);
                        const isVisible = visibleIds.includes(credential.id);

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
                                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                                <User className="w-3 h-3" />
                                                {credential.clientName}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="badge badge-primary">
                                        {getTypeLabel(credential.type)}
                                    </span>
                                </div>

                                {/* Value Display */}
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-background-secondary">
                                    <code className="flex-1 text-sm font-mono text-text-secondary truncate">
                                        {isVisible ? "demo_value_12345" : credential.maskedValue}
                                    </code>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => toggleVisibility(credential.id)}
                                            className="p-2 rounded-lg hover:bg-background-tertiary text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            {isVisible ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(credential.maskedValue)}
                                            className="p-2 rounded-lg hover:bg-background-tertiary text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredCredentials.length === 0 && (
                    <div className="text-center py-12">
                        <Shield className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <p className="text-text-secondary">Nenhuma credencial encontrada</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
