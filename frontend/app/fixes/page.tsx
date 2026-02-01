"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Scale,
    ChevronLeft,
    ChevronDown,
    Shield,
    FileText,
    Home,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Wrench,
    Code2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { TabNavigation } from "@/components/TabNavigation";

interface ComplianceIssue {
    severity: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
    title: string;
    summary: string;
    problem: string;
    fix: string;
    steps: string[];
}

export default function FixesPage() {
    const searchParams = useSearchParams();
    const runId = searchParams.get("run_id");
    const featureId = searchParams.get("feature_id");

    const [openIssueIndex, setOpenIssueIndex] = useState<number | null>(null);
    const [fixes, setFixes] = useState<ComplianceIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [executiveSummary, setExecutiveSummary] = useState("");

    useEffect(() => {
        const fetchOrGenerateFixes = async () => {
            if (!runId || !featureId) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Existing Results
                const result = await api.pipeline.getResults(featureId, runId);

                // Check if 'auto_fix' exists in the DB result
                let autoFixData = result.auto_fix;

                // 2. If no fixes found, Trigger Generation (The "Agentic" part)
                if (!autoFixData || !autoFixData.fixes || autoFixData.fixes.length === 0) {
                    setGenerating(true);
                    try {
                        const autofixResult = await api.pipeline.runAutofix(featureId, runId);
                        autoFixData = autofixResult.auto_fix;
                    } catch (genError) {
                        console.error("Failed to generate fixes:", genError);
                    } finally {
                        setGenerating(false);
                    }
                }

                // 3. Map Data to UI
                if (autoFixData && autoFixData.fixes) {
                    setExecutiveSummary(autoFixData.summary || "Compliance remediation plan ready.");
                    mapAndSetFixes(autoFixData.fixes);
                }

            } catch (error) {
                console.error("Failed to fetch/generate fixes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrGenerateFixes();
    }, [runId, featureId]);

    const mapAndSetFixes = (backendFixes: any[]) => {
        const mapped = backendFixes.map((f: any) => ({
            severity: (f.severity || "MEDIUM").toUpperCase(),
            title: f.title || "Compliance Fix",
            summary: f.description || "No description provided.",
            problem: f.issue_reference || "Associated with identified compliance gap.",
            fix: f.remediation_strategy || "Apply recommended changes.",
            steps: Array.isArray(f.implementation_steps)
                ? f.implementation_steps
                : [f.implementation_steps || "Review code manually."]
        }));
        setFixes(mapped);
    };

    const toggleIssue = (index: number) => {
        setOpenIssueIndex(openIssueIndex === index ? null : index);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "CRITICAL":
            case "HIGH":
                return {
                    badge: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30",
                    icon: "text-red-600 dark:text-red-400"
                };
            case "MEDIUM":
                return {
                    badge: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30",
                    icon: "text-amber-600 dark:text-amber-400"
                };
            case "LOW":
                return {
                    badge: "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/30",
                    icon: "text-teal-600 dark:text-teal-400"
                };
            default:
                return {
                    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700",
                    icon: "text-slate-600 dark:text-slate-400"
                };
        }
    };

    if (loading || generating) {
        return (
            <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-teal animate-spin" />
                    <Wrench className="w-6 h-6 text-teal absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="font-serif text-2xl text-teal">
                        {generating ? "Architecting Solutions..." : "Loading Fixes..."}
                    </h2>
                    <p className="text-slate/60 font-mono text-sm max-w-md">
                        JurAI agents are generating engineering steps for your compliance gaps.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment">
            {/* Header */}
            <header className="px-6 py-6 border-b border-charcoal/5 dark:border-white/5 flex justify-between items-center bg-parchment/50 dark:bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-teal" />
                        <span className="font-serif text-lg font-bold tracking-tight text-teal dark:text-parchment">JurAI</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate/50">Engineering Plan</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
                <TabNavigation activeTab="fixes" />

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal/5 border border-teal/20 rounded-full mb-4">
                        <Code2 className="w-4 h-4 text-teal" />
                        <span className="text-xs font-mono uppercase tracking-widest text-teal">Auto-Fix Generated</span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl text-teal dark:text-parchment tracking-tight">
                        Remediation Plan
                    </h1>
                    <p className="text-lg text-slate/60 dark:text-slate/40 max-w-2xl mx-auto font-light">
                        Actionable engineering steps to mitigate identified risks.
                    </p>
                </motion.div>

                {/* Compliance Issues Accordion */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-serif text-2xl text-teal dark:text-parchment">Task List</h2>
                        <span className="text-sm text-slate/50 font-mono">{fixes.length} Tasks</span>
                    </div>

                    <div className="space-y-3">
                        {fixes.map((issue, index) => {
                            const isOpen = openIssueIndex === index;
                            const colors = getSeverityColor(issue.severity);

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all"
                                >
                                    {/* Collapsed Header */}
                                    <button
                                        onClick={() => toggleIssue(index)}
                                        className="w-full p-6 flex items-center justify-between hover:bg-charcoal/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1 text-left">
                                            {/* Risk Badge */}
                                            <div className={cn("px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider min-w-[80px] text-center", colors.badge)}>
                                                {issue.severity}
                                            </div>

                                            {/* Issue Info */}
                                            <div className="flex-1">
                                                <h3 className="font-medium text-lg text-charcoal dark:text-parchment mb-1">
                                                    {issue.title}
                                                </h3>
                                                <p className="text-sm text-slate/60 dark:text-slate/40 font-light truncate max-w-lg">
                                                    {issue.summary}
                                                </p>
                                            </div>
                                        </div>

                                        <ChevronDown
                                            className={cn(
                                                "w-5 h-5 text-slate/40 transition-transform duration-300 flex-shrink-0 ml-4",
                                                isOpen && "rotate-180"
                                            )}
                                        />
                                    </button>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 space-y-6 border-t border-charcoal/5 dark:border-white/5 pt-6 bg-charcoal/[0.02] dark:bg-white/[0.02]">
                                                    {/* Context Grid */}
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        {/* Why This Is A Problem */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <AlertCircle className={cn("w-4 h-4", colors.icon)} />
                                                                <h4 className="text-xs font-mono uppercase tracking-widest text-slate/50">
                                                                    Issue Context
                                                                </h4>
                                                            </div>
                                                            <p className="text-sm text-slate/70 dark:text-slate/40 leading-relaxed font-light bg-white dark:bg-black/20 p-3 rounded border border-charcoal/5 dark:border-white/5">
                                                                {issue.problem}
                                                            </p>
                                                        </div>

                                                        {/* Recommended Fix */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-teal" />
                                                                <h4 className="text-xs font-mono uppercase tracking-widest text-slate/50">
                                                                    Strategy
                                                                </h4>
                                                            </div>
                                                            <p className="text-sm text-charcoal dark:text-parchment font-medium bg-white dark:bg-black/20 p-3 rounded border border-charcoal/5 dark:border-white/5">
                                                                {issue.fix}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Implementation Steps */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Code2 className="w-4 h-4 text-teal" />
                                                            <h4 className="text-xs font-mono uppercase tracking-widest text-teal">
                                                                Implementation Steps
                                                            </h4>
                                                        </div>
                                                        <ul className="space-y-0 border border-charcoal/10 dark:border-white/10 rounded bg-white dark:bg-black/20 divide-y divide-charcoal/5 dark:divide-white/5">
                                                            {issue.steps.map((step, stepIndex) => (
                                                                <li key={stepIndex} className="flex items-start gap-4 p-4 hover:bg-teal/[0.02] transition-colors">
                                                                    <span className="font-mono text-xs text-teal/50 mt-1 select-none">
                                                                        {(stepIndex + 1).toString().padStart(2, '0')}
                                                                    </span>
                                                                    <span className="text-sm text-slate/70 dark:text-slate/30 font-mono flex-1 leading-relaxed">
                                                                        {step}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* Executive Summary */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm p-8 space-y-4"
                >
                    <div>
                        <h2 className="font-serif text-3xl text-teal dark:text-parchment mb-2">Executive Summary</h2>
                        <p className="text-xs font-mono uppercase tracking-widest text-amber-500">
                            Generated by JurAI Auto-Fix
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-slate/70 dark:text-slate/40 leading-relaxed font-light">
                            {executiveSummary}
                        </p>
                    </div>
                </motion.section>

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                >
                    <button
                        className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 text-charcoal dark:text-parchment font-medium rounded-sm hover:bg-charcoal/5 dark:hover:bg-white/5 transition-all w-full sm:w-auto"
                        onClick={() => alert("Coming soon!")}
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export JIRA Tickets
                    </button>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-4 bg-teal text-parchment font-serif text-lg rounded-sm shadow-xl hover:shadow-teal/30 transition-all duration-500 group w-full sm:w-auto"
                    >
                        <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Return Home
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}