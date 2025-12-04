"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Smartphone,
    Monitor,
    Apple,
    Chrome,
    Share,
    Plus,
    MoreVertical,
    Download,
    CheckCircle2,
    ArrowRight,
    Home,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type DeviceType = "ios" | "android" | "desktop" | "unknown";
type BrowserType = "safari" | "chrome" | "firefox" | "edge" | "samsung" | "unknown";

interface InstallStep {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function InstallPage() {
    const [device, setDevice] = useState<DeviceType>("unknown");
    const [browser, setBrowser] = useState<BrowserType>("unknown");
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect device
        const userAgent = navigator.userAgent.toLowerCase();

        if (/iphone|ipad|ipod/.test(userAgent)) {
            setDevice("ios");
        } else if (/android/.test(userAgent)) {
            setDevice("android");
        } else if (/windows|macintosh|linux/.test(userAgent)) {
            setDevice("desktop");
        }

        // Detect browser
        if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
            setBrowser("safari");
        } else if (/samsungbrowser/.test(userAgent)) {
            setBrowser("samsung");
        } else if (/chrome/.test(userAgent) && !/edge/.test(userAgent)) {
            setBrowser("chrome");
        } else if (/firefox/.test(userAgent)) {
            setBrowser("firefox");
        } else if (/edge/.test(userAgent)) {
            setBrowser("edge");
        }

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsStandalone(true);
        }
    }, []);

    const getDeviceIcon = () => {
        switch (device) {
            case "ios": return <Apple className="w-6 h-6" />;
            case "android": return <Smartphone className="w-6 h-6" />;
            case "desktop": return <Monitor className="w-6 h-6" />;
            default: return <Smartphone className="w-6 h-6" />;
        }
    };

    const getDeviceName = () => {
        switch (device) {
            case "ios": return "iPhone/iPad";
            case "android": return "Android";
            case "desktop": return "Desktop";
            default: return "Dispositivo";
        }
    };

    const getBrowserName = () => {
        switch (browser) {
            case "safari": return "Safari";
            case "chrome": return "Chrome";
            case "firefox": return "Firefox";
            case "edge": return "Edge";
            case "samsung": return "Samsung Internet";
            default: return "Navegador";
        }
    };

    const getInstallSteps = (): InstallStep[] => {
        if (device === "ios") {
            return [
                {
                    icon: <Share className="w-5 h-5" />,
                    title: "Toque no botão Compartilhar",
                    description: "Na barra inferior do Safari, toque no ícone de compartilhar (quadrado com seta para cima)"
                },
                {
                    icon: <Plus className="w-5 h-5" />,
                    title: "Adicionar à Tela de Início",
                    description: "Role para baixo e toque em \"Adicionar à Tela de Início\""
                },
                {
                    icon: <CheckCircle2 className="w-5 h-5" />,
                    title: "Confirme a instalação",
                    description: "Toque em \"Adicionar\" no canto superior direito"
                }
            ];
        } else if (device === "android") {
            if (browser === "samsung") {
                return [
                    {
                        icon: <MoreVertical className="w-5 h-5" />,
                        title: "Abra o menu",
                        description: "Toque no ícone de três linhas ou três pontos no canto superior"
                    },
                    {
                        icon: <Plus className="w-5 h-5" />,
                        title: "Adicionar à Tela inicial",
                        description: "Selecione \"Adicionar página a\" > \"Tela inicial\""
                    },
                    {
                        icon: <CheckCircle2 className="w-5 h-5" />,
                        title: "Confirme",
                        description: "Toque em \"Adicionar\" para instalar o app"
                    }
                ];
            }
            return [
                {
                    icon: <MoreVertical className="w-5 h-5" />,
                    title: "Abra o menu do Chrome",
                    description: "Toque nos três pontos no canto superior direito"
                },
                {
                    icon: <Download className="w-5 h-5" />,
                    title: "Instalar aplicativo",
                    description: "Toque em \"Instalar aplicativo\" ou \"Adicionar à tela inicial\""
                },
                {
                    icon: <CheckCircle2 className="w-5 h-5" />,
                    title: "Confirme a instalação",
                    description: "Toque em \"Instalar\" na janela que aparecer"
                }
            ];
        } else {
            return [
                {
                    icon: <Chrome className="w-5 h-5" />,
                    title: "Use o Chrome ou Edge",
                    description: "Para melhor experiência, acesse pelo Chrome ou Microsoft Edge"
                },
                {
                    icon: <Download className="w-5 h-5" />,
                    title: "Clique no ícone de instalação",
                    description: "Na barra de endereço, clique no ícone de instalação (computador com seta)"
                },
                {
                    icon: <CheckCircle2 className="w-5 h-5" />,
                    title: "Confirme a instalação",
                    description: "Clique em \"Instalar\" na janela que aparecer"
                }
            ];
        }
    };

    const steps = getInstallSteps();

    if (isStandalone) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-3">
                        App já instalado! 🎉
                    </h1>
                    <p className="text-text-secondary mb-8">
                        O InovaSys Manager já está instalado no seu dispositivo.
                        Aproveite a experiência completa!
                    </p>
                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary flex items-center gap-2 mx-auto"
                        >
                            <Home className="w-5 h-5" />
                            Ir para o Dashboard
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-strong px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-32 h-10">
                            <Image
                                src="/logo.png"
                                alt="InovaSys"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>
                    <Link href="/" className="text-sm text-primary hover:underline">
                        Pular
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-glow">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary mb-3">
                        Instale o InovaSys Manager
                    </h1>
                    <p className="text-text-secondary text-lg">
                        Tenha acesso rápido ao seu ERP direto da tela inicial
                    </p>
                </motion.div>

                {/* Device Detection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-elevated p-4 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/15 text-primary">
                            {getDeviceIcon()}
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Dispositivo detectado</p>
                            <p className="font-semibold text-text-primary">
                                {getDeviceName()} • {getBrowserName()}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Installation Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10"
                >
                    <h2 className="text-lg font-semibold text-text-primary mb-4">
                        Como instalar
                    </h2>
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="flex gap-4 p-4 rounded-xl bg-background-secondary border border-border"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-primary">{step.icon}</span>
                                        <h3 className="font-medium text-text-primary">{step.title}</h3>
                                    </div>
                                    <p className="text-sm text-text-secondary">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-10"
                >
                    <h2 className="text-lg font-semibold text-text-primary mb-4">
                        Vantagens do App
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: "⚡", title: "Acesso Rápido", desc: "Abra direto da tela inicial" },
                            { icon: "📱", title: "Tela Cheia", desc: "Experiência imersiva" },
                            { icon: "🔔", title: "Notificações", desc: "Alertas em tempo real" },
                            { icon: "🌐", title: "Offline", desc: "Funciona sem internet" },
                        ].map((benefit, index) => (
                            <div
                                key={index}
                                className="p-3 rounded-xl bg-background-tertiary border border-border"
                            >
                                <span className="text-2xl mb-2 block">{benefit.icon}</span>
                                <h3 className="font-medium text-text-primary text-sm">{benefit.title}</h3>
                                <p className="text-xs text-text-muted">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <p className="text-text-muted text-sm mb-4">
                        Depois de instalar, o app aparecerá na sua tela inicial
                    </p>
                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-secondary flex items-center gap-2 mx-auto"
                        >
                            Continuar sem instalar
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-sm text-text-muted">
                Desenvolvido com 💚 pela{" "}
                <a
                    href="https://inovasys.digital"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                >
                    InovaSys
                </a>
            </footer>
        </div>
    );
}
