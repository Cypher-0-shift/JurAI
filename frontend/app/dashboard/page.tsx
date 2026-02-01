"use client";

import { Scale, Shield, Gavel } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

// --- Navigation Component ---
function Navigation() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="fixed top-0 w-full z-50 bg-parchment/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-charcoal/5 dark:border-white/5 px-6 py-4 flex justify-between items-center"
        >
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="relative">
                        <Scale className="w-6 h-6 text-teal transition-transform group-hover:rotate-12" />
                        <motion.div
                            className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    </div>
                    <span className="font-serif text-xl font-bold tracking-tight text-teal dark:text-parchment">JurAI</span>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 mr-2 pr-4 border-r border-charcoal/10 dark:border-white/10">
                    <ThemeToggle />
                </div>
                <button className="hidden sm:block text-sm font-medium text-teal dark:text-parchment px-4 py-2 hover:bg-teal/5 rounded-sm transition-colors">
                    Log In
                </button>
                <button className="text-sm font-medium bg-teal text-parchment px-5 py-2 rounded-sm shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5 transition-all active:translate-y-0">
                    Sign Up
                </button>
            </div>
        </motion.nav>
    );
}

// --- Dashboard Component ---
export default function DashboardPage() {
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] as const,
                delay: 0.3
            }
        },
        hover: {
            scale: 1.02,
            transition: { duration: 0.3 }
        }
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as const,
                staggerChildren: 0.1,
                delayChildren: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
        }
    };

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment selection:bg-teal/10 selection:text-teal font-sans">
            <Navigation />

            {/* Animated Background Elements */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                        scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute top-1/4 left-1/4 w-[50rem] h-[50rem] border border-teal/5 dark:border-teal/10 rounded-full"
                />
                <motion.div
                    animate={{
                        rotate: -360,
                        scale: [1, 1.05, 1]
                    }}
                    transition={{
                        rotate: { duration: 50, repeat: Infinity, ease: "linear" },
                        scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] border border-teal/5 dark:border-teal/10 rounded-full"
                />
            </div>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="text-center mb-16 space-y-8"
                    >
                        <div className="relative">
                            {/* Animated Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 1, ease: "backOut", delay: 0.2 }}
                                className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-teal/10 to-teal/5 dark:from-teal/20 dark:to-teal/10 border border-teal/10 flex items-center justify-center relative"
                            >
                                <Shield className="w-12 h-12 text-teal" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-2 border-2 border-teal/20 border-t-transparent rounded-full"
                                />
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="font-serif text-5xl md:text-6xl lg:text-7xl text-teal dark:text-parchment tracking-tight mb-6"
                            >
                                Judicial Compliance Review
                            </motion.h1>

                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.8, delay: 0.4, ease: "circOut" }}
                                className="w-40 h-1 bg-gradient-to-r from-teal via-gold to-teal mx-auto rounded-full"
                            />
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="text-xl text-slate/70 dark:text-slate/40 max-w-2xl mx-auto font-light leading-relaxed"
                        >
                            Access our judicial-grade AI system for comprehensive legal compliance assessment
                        </motion.p>
                    </motion.div>

                    {/* Single Feature Card */}
                    <div className="flex justify-center">
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            className="relative group w-full max-w-2xl"
                        >
                            {/* Card Glow Effect */}
                            <motion.div
                                animate={{
                                    opacity: [0.3, 0.5, 0.3],
                                    scale: [1, 1.02, 1]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -inset-0.5 bg-gradient-to-r from-teal/20 via-gold/20 to-teal/20 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"
                            />

                            {/* Main Card */}
                            <Link href="/questionnaire">
                                <div className="relative bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-xl shadow-2xl p-10 md:p-14 cursor-pointer overflow-hidden">
                                    {/* Decorative Elements */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal via-gold to-teal" />
                                    <div className="absolute -top-3 -right-3">
                                        <motion.div
                                            animate={{ rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="text-xs font-mono text-teal/60 bg-teal/5 dark:bg-teal/10 px-4 py-2 rounded-full border border-teal/10 tracking-widest"
                                        >
                                            AVAILABLE NOW
                                        </motion.div>
                                    </div>

                                    {/* Floating Particles */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute top-6 left-6 w-2 h-2 rounded-full bg-teal/30"
                                    />
                                    <motion.div
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                                        className="absolute bottom-8 right-8 w-1 h-1 rounded-full bg-gold/30"
                                    />

                                    <motion.div
                                        variants={contentVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-8 relative z-10"
                                    >
                                        {/* Card Header */}
                                        <motion.div variants={itemVariants} className="flex items-start gap-6">
                                            <div className="relative">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-0 bg-gradient-to-br from-teal/20 to-gold/20 rounded-lg blur-lg"
                                                />
                                                <div className="relative w-16 h-16 rounded-lg bg-gradient-to-br from-teal/10 to-teal/5 dark:from-teal/20 dark:to-teal/10 border border-teal/10 flex items-center justify-center">
                                                    <Gavel className="w-8 h-8 text-teal" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="font-serif text-3xl text-teal dark:text-parchment mb-3">
                                                    AI Compliance Assessment
                                                </h2>
                                                <p className="text-slate/60 dark:text-slate/40 font-light leading-relaxed">
                                                    Our flagship feature powered by judicial-grade artificial intelligence to analyze your product against global regulations.
                                                </p>
                                            </div>
                                        </motion.div>

                                        {/* Divider */}
                                        <motion.div variants={itemVariants} className="h-px bg-gradient-to-r from-transparent via-charcoal/5 dark:via-white/5 to-transparent" />

                                        {/* Feature Description */}
                                        <motion.div variants={itemVariants} className="space-y-4">
                                            <h3 className="font-serif text-xl text-teal dark:text-parchment">
                                                What This Feature Does
                                            </h3>
                                            <ul className="space-y-3">
                                                {[
                                                    "Analyzes product features against global regulatory frameworks",
                                                    "Identifies potential compliance gaps and legal risks",
                                                    "Provides judicial-grade risk assessments",
                                                    "Generates compliance reports with actionable insights",
                                                    "Continuously updates with new regulations and precedents"
                                                ].map((item, index) => (
                                                    <motion.li
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                                                        className="flex items-start gap-3 text-slate/70 dark:text-slate/40 font-light"
                                                    >
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                                            className="w-1.5 h-1.5 rounded-full bg-teal mt-2 flex-shrink-0"
                                                        />
                                                        <span>{item}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>

                                        {/* Divider */}
                                        <motion.div variants={itemVariants} className="h-px bg-gradient-to-r from-transparent via-charcoal/5 dark:via-white/5 to-transparent" />

                                        {/* CTA Section */}
                                        <motion.div variants={itemVariants} className="pt-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate/50 dark:text-slate/40 font-light">
                                                        Click to begin your compliance review
                                                    </p>
                                                    <p className="text-xs text-teal/60 font-mono uppercase tracking-widest mt-1">
                                                        Powered by JurAI Judicial Intelligence
                                                    </p>
                                                </div>
                                                <motion.div
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-teal to-teal/80 text-parchment"
                                                >
                                                    <motion.svg
                                                        animate={{ rotate: 90 }}
                                                        transition={{ duration: 0.5 }}
                                                        className="w-6 h-6"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </motion.svg>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Hover Overlay */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        className="absolute inset-0 bg-gradient-to-br from-teal/5 via-transparent to-gold/5 pointer-events-none"
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Bottom Note */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="mt-16 text-center"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/50 dark:bg-[#151515]/50 border border-charcoal/10 dark:border-white/10 rounded-xl backdrop-blur-sm">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-teal/30 border-t-teal rounded-full"
                            />
                            <p className="text-sm text-slate/60 dark:text-slate/40 font-light">
                                This is our flagship feature. More capabilities coming soon.
                            </p>
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-2 h-2 rounded-full bg-teal"
                            />
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
