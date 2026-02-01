"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Camera,
    ChevronRight,
    History,
    Settings,
    Bell,
    ShieldCheck,
    FileText,
    LogOut,
    Trash2,
    Scale,
    ChevronLeft,
    CheckCircle2,
    Clock
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock data for UI development
const MOCK_USER = {
    name: "Alexander Hamilton",
    email: "hamilton@treasury.gov",
    phone: "+1 (555) 1789-1804",
    avatar: null,
};

const MOCK_REVIEWS = [
    { id: "REV-90210", name: "FinTech Payment Gateway", date: "Oct 24, 2023", status: "Completed" },
    { id: "REV-88231", name: "HealthData Sync API", date: "Nov 12, 2023", status: "In Progress" },
];

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment pb-20">
            {/* Header */}
            <header className="px-6 py-6 border-b border-charcoal/5 dark:border-white/5 flex justify-between items-center bg-parchment/50 dark:bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-teal/5 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-teal" />
                    </Link>
                    <h1 className="font-serif text-xl font-bold text-teal dark:text-parchment">Profile</h1>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm font-medium text-teal hover:underline"
                >
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
            </header>

            <main className="max-w-2xl mx-auto p-6 space-y-8">
                {/* Profile Hero */}
                <section className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-teal/10 border-2 border-teal/20 flex items-center justify-center overflow-hidden">
                            {MOCK_USER.avatar ? (
                                <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-teal/40" />
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-teal text-parchment rounded-full shadow-lg hover:scale-110 transition-transform">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h2 className="font-serif text-2xl text-teal dark:text-parchment">{MOCK_USER.name}</h2>
                        <p className="text-sm text-slate/50 font-mono uppercase tracking-widest">{MOCK_USER.email}</p>
                    </div>
                </section>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Personal Information */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold px-1">Personal Information</h3>
                        <div className="bg-white dark:bg-[#151515] border border-charcoal/5 dark:border-white/5 rounded-sm divide-y divide-charcoal/5 dark:divide-white/5">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-teal/60" />
                                    <span className="text-sm font-medium">Full Name</span>
                                </div>
                                <span className="text-sm text-slate/60">{MOCK_USER.name}</span>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-teal/60" />
                                    <span className="text-sm font-medium">Email</span>
                                </div>
                                <span className="text-sm text-slate/60">{MOCK_USER.email}</span>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-teal/60" />
                                    <span className="text-sm font-medium">Phone</span>
                                </div>
                                <span className="text-sm text-slate/60">{MOCK_USER.phone || "Not provided"}</span>
                            </div>
                        </div>
                    </section>

                    {/* Activity / History */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">Compliance History</h3>
                            <Link href="/history" className="text-[10px] font-mono uppercase text-teal hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {MOCK_REVIEWS.map((review) => (
                                <div key={review.id} className="bg-white dark:bg-[#151515] border border-charcoal/5 dark:border-white/5 p-4 rounded-sm flex items-center justify-between group hover:border-teal/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-2 rounded-full",
                                            review.status === "Completed" ? "bg-teal/10 text-teal" : "bg-gold/10 text-gold"
                                        )}>
                                            {review.status === "Completed" ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium group-hover:text-teal transition-colors">{review.name}</h4>
                                            <p className="text-[10px] text-slate/40 font-mono uppercase">{review.id} • {review.date}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate/20 group-hover:text-teal transition-colors" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Account Settings */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold px-1">Account Settings</h3>
                        <div className="bg-white dark:bg-[#151515] border border-charcoal/5 dark:border-white/5 rounded-sm overflow-hidden">
                            {[
                                { icon: Bell, label: "Notifications", color: "text-teal/60" },
                                { icon: ShieldCheck, label: "Privacy & Data", color: "text-teal/60" },
                                { icon: FileText, label: "Terms of Service", color: "text-teal/60" },
                            ].map((item, i) => (
                                <button key={i} className="w-full p-4 flex items-center justify-between hover:bg-teal/5 transition-colors border-b border-charcoal/5 dark:border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn("w-4 h-4", item.color)} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate/20" />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="pt-4 space-y-4">
                        <button className="w-full p-4 flex items-center justify-center gap-2 bg-charcoal/5 dark:bg-white/5 text-slate hover:bg-red-500/10 hover:text-red-500 transition-all rounded-sm font-medium text-sm">
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                        <button className="w-full p-4 flex items-center justify-center gap-2 text-red-500/60 hover:text-red-500 transition-colors text-xs font-mono uppercase tracking-widest">
                            <Trash2 className="w-3 h-3" />
                            Delete Account
                        </button>
                    </section>
                </motion.div>
            </main>

            {/* Background Decoration */}
            <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.02] dark:opacity-[0.05]">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-teal blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gold blur-[120px] rounded-full" />
            </div>
        </div>
    );
}