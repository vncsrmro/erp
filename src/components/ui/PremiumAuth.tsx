'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Shield,
    AlertTriangle,
    KeyRound,
    Phone,
    Loader2,
    CheckCircle,
} from 'lucide-react';

// Types
type AuthMode = 'login' | 'signup' | 'reset';

interface AuthFormProps {
    onSuccess?: (userData: { email: string; name?: string }) => void;
    onForgotPassword?: (email: string) => Promise<{ error?: { message: string } }>;
    onSignIn?: (email: string, password: string) => Promise<{ error?: { message: string } }>;
    onSignUp?: (email: string, password: string) => Promise<{ error?: { message: string } }>;
    initialMode?: AuthMode;
    className?: string;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    agreeToTerms: boolean;
    rememberMe: boolean;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    agreeToTerms?: string;
    general?: string;
}

// Password strength utility
interface PasswordStrength {
    score: number;
    feedback: string[];
    requirements: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const feedback: string[] = [];

    if (!requirements.length) feedback.push('Mínimo 8 caracteres');
    if (!requirements.uppercase) feedback.push('Uma letra maiúscula');
    if (!requirements.lowercase) feedback.push('Uma letra minúscula');
    if (!requirements.number) feedback.push('Um número');
    if (!requirements.special) feedback.push('Um caractere especial');

    return { score, feedback, requirements };
};

// Password Strength Indicator Component
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
    const strength = calculatePasswordStrength(password);

    const getStrengthColor = (score: number) => {
        if (score <= 1) return 'bg-danger';
        if (score <= 2) return 'bg-orange-500';
        if (score <= 3) return 'bg-warning';
        if (score <= 4) return 'bg-blue-500';
        return 'bg-success';
    };

    const getStrengthText = (score: number) => {
        if (score <= 1) return 'Muito Fraca';
        if (score <= 2) return 'Fraca';
        if (score <= 3) return 'Razoável';
        if (score <= 4) return 'Boa';
        return 'Forte';
    };

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2 animate-in fade-in-50 slide-in-from-bottom-1">
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-background-tertiary rounded-full h-2 overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-300", getStrengthColor(strength.score))}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                </div>
                <span className="text-xs text-text-muted min-w-[70px]">
                    {getStrengthText(strength.score)}
                </span>
            </div>
            {strength.feedback.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                    {strength.feedback.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 text-xs text-warning"
                        >
                            <AlertTriangle className="h-3 w-3" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export function PremiumAuth({
    onSuccess,
    onForgotPassword,
    onSignIn,
    onSignUp,
    initialMode = 'login',
    className,
}: AuthFormProps) {
    const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agreeToTerms: false,
        rememberMe: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});

    // Load saved email on mount
    React.useEffect(() => {
        const savedEmail = localStorage.getItem('userEmail');
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (savedEmail && authMode === 'login') {
            setFormData(prev => ({ ...prev, email: savedEmail, rememberMe }));
        }
    }, [authMode]);

    // Field validation
    const validateField = useCallback((field: keyof FormData, value: string | boolean) => {
        let error = '';

        switch (field) {
            case 'name':
                if (typeof value === 'string' && authMode === 'signup' && !value.trim()) {
                    error = 'Nome é obrigatório';
                }
                break;

            case 'email':
                if (!value || (typeof value === 'string' && !value.trim())) {
                    error = 'E-mail é obrigatório';
                } else if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Digite um e-mail válido';
                }
                break;

            case 'password':
                if (!value) {
                    error = 'Senha é obrigatória';
                } else if (typeof value === 'string') {
                    if (value.length < 6) {
                        error = 'Senha deve ter pelo menos 6 caracteres';
                    }
                }
                break;

            case 'confirmPassword':
                if (authMode === 'signup' && value !== formData.password) {
                    error = 'As senhas não coincidem';
                }
                break;

            case 'agreeToTerms':
                if (authMode === 'signup' && !value) {
                    error = 'Você deve aceitar os termos';
                }
                break;
        }

        return error;
    }, [formData.password, authMode]);

    const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (fieldTouched[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({ ...prev, [field]: error || undefined }));
        }
    }, [fieldTouched, validateField]);

    const handleFieldBlur = useCallback((field: keyof FormData) => {
        setFieldTouched(prev => ({ ...prev, [field]: true }));
        const value = formData[field];
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }, [formData, validateField]);

    const validateForm = useCallback(() => {
        const newErrors: FormErrors = {};
        const fieldsToValidate: (keyof FormData)[] = ['email', 'password'];

        if (authMode === 'signup') {
            fieldsToValidate.push('confirmPassword', 'agreeToTerms');
        }

        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error && field in ({} as FormErrors)) {
                (newErrors as Record<string, string>)[field] = error;
            } else if (error) {
                (newErrors as Record<string, string>)[field] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [authMode, formData, validateField]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            if (authMode === 'login') {
                if (formData.rememberMe) {
                    localStorage.setItem('userEmail', formData.email);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('rememberMe');
                }

                const result = await onSignIn?.(formData.email, formData.password);
                if (result?.error) {
                    setErrors({ general: result.error.message });
                } else {
                    setSuccessMessage('Login realizado com sucesso!');
                    onSuccess?.({ email: formData.email });
                }

            } else if (authMode === 'signup') {
                const result = await onSignUp?.(formData.email, formData.password);
                if (result?.error) {
                    setErrors({ general: result.error.message });
                } else {
                    setSuccessMessage('Conta criada! Verifique seu e-mail para confirmar.');
                }

            } else if (authMode === 'reset') {
                const result = await onForgotPassword?.(formData.email);
                if (result?.error) {
                    setErrors({ general: result.error.message });
                } else {
                    setSuccessMessage('E-mail de recuperação enviado!');
                }
            }

        } catch {
            setErrors({ general: 'Erro na autenticação. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderAuthContent = () => {
        // Password reset form
        if (authMode === 'reset') {
            return (
                <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-text-primary">Recuperar Senha</h3>
                        <p className="text-text-muted text-sm">
                            Digite seu e-mail para receber o link de recuperação.
                        </p>
                    </div>

                    <div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                onBlur={() => handleFieldBlur('email')}
                                className={cn(
                                    "w-full pl-10 pr-4 py-3 bg-background-secondary border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
                                    errors.email ? "border-danger" : "border-border"
                                )}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-danger text-xs mt-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !formData.email}
                        className={cn(
                            "w-full bg-primary text-white font-medium py-3 px-6 rounded-xl transition-all",
                            "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        <span className="flex items-center justify-center gap-2">
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <KeyRound className="h-5 w-5" />
                                    Enviar Link
                                </>
                            )}
                        </span>
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setAuthMode('login')}
                            className="text-primary hover:text-primary/80 text-sm transition-colors"
                        >
                            Voltar ao Login
                        </button>
                    </div>
                </div>
            );
        }

        // Default login/signup form
        return (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-5">
                {/* Email */}
                <div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
                        <input
                            type="email"
                            placeholder="E-mail"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onBlur={() => handleFieldBlur('email')}
                            className={cn(
                                "w-full pl-10 pr-4 py-3 bg-background-secondary border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
                                errors.email ? "border-danger" : "border-border"
                            )}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-danger text-xs mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            onBlur={() => handleFieldBlur('password')}
                            className={cn(
                                "w-full pl-10 pr-12 py-3 bg-background-secondary border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
                                errors.password ? "border-danger" : "border-border"
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-danger text-xs mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.password}
                        </p>
                    )}
                    {authMode === 'signup' && (
                        <PasswordStrengthIndicator password={formData.password} />
                    )}
                </div>

                {/* Confirm Password (signup only) */}
                {authMode === 'signup' && (
                    <div>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmar Senha"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                onBlur={() => handleFieldBlur('confirmPassword')}
                                className={cn(
                                    "w-full pl-10 pr-12 py-3 bg-background-secondary border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
                                    errors.confirmPassword ? "border-danger" : "border-border"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-danger text-xs mt-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>
                )}

                {/* Remember me / Forgot password */}
                <div className="flex items-center justify-between">
                    {authMode === 'login' ? (
                        <>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                                    className="w-4 h-4 rounded border-border bg-background-secondary text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-sm text-text-muted">Lembrar-me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setAuthMode('reset')}
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                Esqueceu a senha?
                            </button>
                        </>
                    ) : (
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded border-border bg-background-secondary text-primary focus:ring-primary focus:ring-offset-0"
                            />
                            <span className="text-sm text-text-muted">
                                Concordo com os{' '}
                                <a href="#" className="text-primary hover:underline">Termos de Uso</a>
                                {' '}e{' '}
                                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
                            </span>
                        </label>
                    )}
                </div>

                {errors.agreeToTerms && (
                    <p className="text-danger text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.agreeToTerms}
                    </p>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full bg-primary text-white font-medium py-3 px-6 rounded-xl transition-all",
                        "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <span className="flex items-center justify-center gap-2">
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            authMode === 'login' ? 'Entrar' : 'Criar Conta'
                        )}
                    </span>
                </button>
            </div>
        );
    };

    return (
        <div className={cn("p-6", className)}>
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-xl flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-5">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-success text-sm">{successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {errors.general && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-xl flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-5">
                    <AlertTriangle className="h-4 w-4 text-danger" />
                    <span className="text-danger text-sm">{errors.general}</span>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    {authMode === 'login' ? 'Bem-vindo de Volta' :
                        authMode === 'reset' ? 'Recuperar Senha' : 'Criar Conta'}
                </h2>
                <p className="text-text-muted">
                    {authMode === 'login' ? 'Acesse sua conta' :
                        authMode === 'reset' ? 'Recupere o acesso' :
                            'Comece gratuitamente'}
                </p>
            </div>

            {/* Mode Toggle Tabs */}
            {authMode !== 'reset' && (
                <div className="flex bg-background-secondary rounded-xl p-1 mb-6">
                    <button
                        onClick={() => setAuthMode('login')}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                            authMode === 'login'
                                ? "bg-background-primary text-text-primary shadow-sm"
                                : "text-text-muted hover:text-text-primary"
                        )}
                        type="button"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setAuthMode('signup')}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                            authMode === 'signup'
                                ? "bg-background-primary text-text-primary shadow-sm"
                                : "text-text-muted hover:text-text-primary"
                        )}
                        type="button"
                    >
                        Cadastrar
                    </button>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
                {renderAuthContent()}
            </form>

            {/* Toggle at bottom */}
            {authMode !== 'reset' && (
                <div className="text-center mt-6">
                    <p className="text-text-muted text-sm">
                        {authMode === 'login' ? "Não tem conta? " : "Já tem conta? "}
                        <button
                            type="button"
                            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            {authMode === 'login' ? 'Cadastre-se' : 'Entrar'}
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
}
