"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-text-primary">
            <div className="bg-background-secondary p-8 rounded-2xl border border-border shadow-2xl max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-danger" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Algo deu errado!</h2>
                    <p className="text-text-secondary text-sm">
                        Não foi possível carregar esta página. Tente recarregar ou volte mais tarde.
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    <Button
                        variant="secondary"
                        onClick={() => window.location.href = "/"}
                    >
                        Voltar ao Início
                    </Button>
                    <Button
                        variant="primary"
                        icon={RefreshCw}
                        onClick={reset}
                    >
                        Tentar Novamente
                    </Button>
                </div>

                {process.env.NODE_ENV === "development" && (
                    <div className="mt-4 p-4 bg-black/30 rounded-lg text-left overflow-auto max-h-40">
                        <p className="text-xs font-mono text-danger">{error.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
