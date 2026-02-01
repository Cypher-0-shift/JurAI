"use client";

import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Key, Globe, Moon, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
    const sections = [
        {
            title: "Account",
            icon: User,
            items: [
                { label: "Profile Information", desc: "Update your name and email endpoint" },
                { label: "Password & Security", desc: "Manage your password and 2FA" },
                { label: "Linked Accounts", desc: "Connect Google or GitHub accounts" }
            ]
        },
        {
            title: "App Preferences",
            icon: Settings,
            items: [
                { label: "Notifications", desc: "Configure email and push alerts" },
                { label: "Appearance", desc: "Theme preferences (Light/Dark)" },
                { label: "Language", desc: "Select your preferred language" }
            ]
        },
        {
            title: "Privacy & Data",
            icon: Shield,
            items: [
                { label: "Data Export", desc: "Download your personal data" },
                { label: "Privacy Settings", desc: "Manage data sharing and visibility" },
                { label: "Cookie Preferences", desc: "Update cookie consent choices" }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment">
            <header className="px-6 py-6 border-b border-charcoal/5 dark:border-white/5 flex items-center gap-4 bg-parchment/50 dark:bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-10">
                <Link href="/dashboard" className="p-2 hover:bg-teal/5 rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5 text-teal rotate-180" />
                </Link>
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-teal" />
                    <span className="font-serif text-lg font-bold tracking-tight text-teal dark:text-parchment">Settings</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-serif text-3xl text-teal dark:text-parchment">Settings</h1>
                            <p className="text-slate/60 dark:text-slate/40">Manage your account and application preferences</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm overflow-hidden"
                            >
                                <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-charcoal/5 dark:border-white/5 flex items-center gap-2">
                                    <section.icon className="w-4 h-4 text-teal" />
                                    <h2 className="font-medium text-sm uppercase tracking-widest text-slate/60 dark:text-slate/40">{section.title}</h2>
                                </div>
                                <div>
                                    {section.items.map((item, i) => (
                                        <div key={i} className="p-5 flex items-center justify-between border-b border-charcoal/5 dark:border-white/5 last:border-0 hover:bg-teal/5 transition-colors cursor-pointer group">
                                            <div>
                                                <h3 className="font-medium text-charcoal dark:text-parchment mb-1 group-hover:text-teal transition-colors">{item.label}</h3>
                                                <p className="text-sm text-slate/60 dark:text-slate/40">{item.desc}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate/30 group-hover:text-teal transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-sm p-6"
                        >
                            <h2 className="font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70 mb-4">Irreversible actions regarding your account and data.</p>
                            <button className="px-4 py-2 bg-white dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-sm text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                Delete Account
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
