"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import "./globals.css";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="pt-BR" className="dark">
            <body className="min-h-screen bg-background text-text-primary antialiased flex items-center justify-center">
                <div className="bg-background-secondary p-8 rounded-2xl border border-border shadow-2xl max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-danger" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Erro Crítico</h2>
                        <p className="text-text-secondary text-sm">
                            Ocorreu um erro inesperado no sistema.
                        </p>
                    </div>

                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all touch-target btn-primary text-base px-5 py-3 w-full"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Recarregar Aplicação
                    </button>

                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-4 p-4 bg-black/30 rounded-lg text-left overflow-auto max-h-40">
                            <p className="text-xs font-mono text-danger">{error.message}</p>
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
