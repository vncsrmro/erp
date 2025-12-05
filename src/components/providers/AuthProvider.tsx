"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { SplashScreen } from "@/components/ui/SplashScreen";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = getSupabase();
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500));
        const authCheck = supabase.auth.getSession();

        Promise.all([authCheck, minLoadTime]).then(([{ data: { session } }]) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                // We don't set loading false here immediately to respect the initial load time
                // But for subsequent auth changes (like sign out), we might want immediate feedback
                // However, since this runs on mount, the Promise.all handles the initial load.
                // For subsequent updates, loading is already false.
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? new Error(error.message) : null };
    };

    const signUp = async (email: string, password: string) => {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signUp({ email, password });
        return { error: error ? new Error(error.message) : null };
    };

    const signOut = async () => {
        const supabase = getSupabase();
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
            {loading ? <SplashScreen /> : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
