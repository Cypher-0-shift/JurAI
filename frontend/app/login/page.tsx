"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gavel, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            setSuccessMessage("Account created successfully! Please sign in.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // FastAPI expects FormData
            const loginData = new FormData();
            loginData.append("username", formData.username);
            loginData.append("password", formData.password);

            const response = await api.auth.login(loginData);

            // Store token
            localStorage.setItem("access_token", response.access_token);
            router.push("/questionnaire");
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Invalid username or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white dark:bg-[#151515] p-8 rounded-sm shadow-2xl border border-charcoal/5 dark:border-white/5">
                <div className="mb-8 text-center">
                    <h1 className="font-serif text-3xl mb-2 text-teal">Welcome Back</h1>
                    <p className="text-slate/60 dark:text-slate/40">Sign in to continue</p>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-sm flex items-start gap-3">
                        <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
                        <span>{successMessage}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-sm flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium opacity-80" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            required
                            className="w-full bg-parchment/50 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium opacity-80" htmlFor="password">Password</label>
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full bg-parchment/50 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 bg-teal hover:bg-teal-dark text-white font-medium py-3 rounded-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate/60 dark:text-slate/40">
                    {/* 
                    Don't have an account?{" "}
                    <Link href="/register" className="text-teal hover:underline font-medium">
                        Create Account
                    </Link>
                    */}
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-parchment dark:bg-charcoal text-charcoal dark:text-parchment flex flex-col font-sans selection:bg-teal selection:text-white">
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center bg-parchment/80 dark:bg-charcoal/80 backdrop-blur-md border-b border-charcoal/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal text-white rounded-sm flex items-center justify-center shadow-lg">
                        <Gavel size={20} />
                    </div>
                    <span className="font-serif text-2xl tracking-tight font-semibold">JurAI</span>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md flex justify-center"
                >
                    <Suspense fallback={<div>Loading...</div>}>
                        <LoginForm />
                    </Suspense>
                </motion.div>
            </main>
        </div>
    );
}