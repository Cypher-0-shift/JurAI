"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gavel, ArrowRight, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            await api.auth.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            // Redirect to login with a success flag
            router.push("/login?registered=true");
        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

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
                    className="w-full max-w-md"
                >
                    <div className="bg-white dark:bg-[#151515] p-8 rounded-sm shadow-2xl border border-charcoal/5 dark:border-white/5 text-center">
                        <h1 className="font-serif text-3xl mb-4 text-teal">Registration Disabled</h1>
                        <p className="text-slate/60 dark:text-slate/40 mb-8">
                            New user registration is currently closed. Please contact your administrator or sign in if you already have an account.
                        </p>

                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center w-full px-6 py-3 bg-teal text-white font-medium rounded-sm shadow-lg hover:bg-teal-dark hover:shadow-xl transition-all group"
                        >
                            Back to Sign In
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}