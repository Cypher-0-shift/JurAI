"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gavel, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

function LoginForm() {
    return (
        <div className="w-full max-w-md">
            <div className="bg-white dark:bg-[#151515] p-8 rounded-sm shadow-2xl border border-charcoal/5 dark:border-white/5 text-center">
                <h1 className="font-serif text-3xl mb-4 text-teal">Login Temporarily Disabled</h1>
                <p className="text-slate/60 dark:text-slate/40 mb-8">
                    Authentication is currently disabled for testing purposes. Please return to the home page.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-teal text-white font-medium rounded-sm shadow-lg hover:bg-teal-dark hover:shadow-xl transition-all group"
                >
                    Back to Home
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
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