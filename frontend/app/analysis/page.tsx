"use client";

import { useState, useEffect, useMemo } from "react";
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
    Code2,
    ArrowRight,
    Zap,
    Filter,
    LayoutGrid,
    List as ListIcon,
    Cpu,
    Database,
    Lock,
    Eye,
    Hammer,
    GitBranch,
    Terminal,
    Copy,
    Check
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

// --- Types & Interfaces ---

interface FixStep {
    id: string;
    text: string;
    isCode?: boolean;
}

interface ComplianceFix {
    id: string;
    title: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    category: "UI" | "DATA" | "LOGIC" | "GOVERNANCE" | "SECURITY";
    summary: string;
    issue_reference: string; // The "Why"
    remediation_strategy: string; // The "What"
    implementation_steps: string[]; // The "How"
    jurisdiction?: string;
    effort: "Low" | "Medium" | "High";
    impact: "Low" | "Medium" | "High";
}

interface Metrics {
    total: number;
    critical: number;
    high: number;
    effort: string;
}

// --- Animation Variants ---

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// --- Mock Data for Offline Dev ---
const MOCK_FIXES: ComplianceFix[] = [
    {
        id: "FIX-001",
        title: "Implement Age Gating Logic",
        severity: "CRITICAL",
        category: "LOGIC",
        summary: "Prevent minors from accessing restricted content.",
        issue_reference: "COPPA & GDPR-K violation: Content accessible without age verification.",
        remediation_strategy: "Implement a middleware interceptor to check 'dob' claim in JWT.",
        implementation_steps: [
            "Create 'AgeVerificationMiddleware' in backend/middleware.",
            "Update User Schema to enforce 'date_of_birth' field.",
            "Add frontend modal for DOB collection on registration.",
            "Configure edge cache to bypass age-gated routes."
        ],
        jurisdiction: "Global",
        effort: "High",
        impact: "High"
    },
    {
        id: "FIX-002",
        title: "Update Cookie Consent Banner",
        severity: "HIGH",
        category: "UI",
        summary: "Ensure 'Reject All' is as visible as 'Accept All'.",
        issue_reference: "GDPR Violation: Dark pattern in consent flow.",
        remediation_strategy: "Redesign the Consent Component to use equal weight buttons.",
        implementation_steps: [
            "Locate 'ConsentBanner.tsx'.",
            "Remove 'secondary' variant from Reject button.",
            "Ensure both buttons have 44px touch target.",
            "Disable pre-ticked 'Marketing' checkboxes."
        ],
        jurisdiction: "EU",
        effort: "Low",
        impact: "High"
    }
];

export default function FixesPage() {
    const searchParams = useSearchParams();
    const runId = searchParams.get("run_id");
    const featureId = searchParams.get("feature_id");

    // --- State ---
    const [status, setStatus] = useState<"LOADING" | "GENERATING" | "READY" | "ERROR">("LOADING");
    const [fixes, setFixes] = useState<ComplianceFix[]>([]);
    const [executiveSummary, setExecutiveSummary] = useState<string>("");

    // UI State
    const [expandedFix, setExpandedFix] = useState<string | null>(null);
    const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
    const [viewMode, setViewMode] = useState<"GRID" | "LIST">("LIST");
    const [copiedStep, setCopiedStep] = useState<number | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);

    // --- Logic ---

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            if (!runId || !featureId) {
                // Dev Fallback
                setTimeout(() => {
                    if (isMounted) {
                        setFixes(MOCK_FIXES);
                        setExecutiveSummary("The analysis indicates critical gaps in data privacy controls. Remediation focuses on backend middleware and UI transparency.");
                        setStatus("READY");
                        setExpandedFix("FIX-001"); // Auto open first
                    }
                }, 2000);
                return;
            }

            try {
                // 1. Fetch Pipeline Results
                const result = await api.pipeline.getResults(featureId, runId);
                const autoFixData = result.auto_fix;

                // 2. Check if fixes exist
                if (autoFixData && autoFixData.fixes && autoFixData.fixes.length > 0) {
                    processFixes(autoFixData);
                    setStatus("READY");
                } else {
                    // 3. If missing, Trigger Agent Generation
                    setStatus("GENERATING");
                    try {
                        const genResult = await api.pipeline.runAutofix(featureId, runId);
                        if (genResult.auto_fix) {
                            processFixes(genResult.auto_fix);
                            setStatus("READY");
                        } else {
                            throw new Error("Generation yielded no fixes.");
                        }
                    } catch (genErr) {
                        console.error("Generation failed:", genErr);
                        setStatus("ERROR");
                    }
                }
            } catch (err) {
                console.error("Fetch failed:", err);
                setStatus("ERROR");
            }
        };

        init();
        return () => { isMounted = false; };
    }, [runId, featureId]);

    const processFixes = (data: any) => {
        setExecutiveSummary(data.summary || "Remediation plan generated.");

        const mapped: ComplianceFix[] = (data.fixes || []).map((f: any, idx: number) => ({
            id: `FIX-${String(idx + 1).padStart(3, '0')}`,
            title: f.title || "Untitled Fix",
            severity: (f.severity || "MEDIUM").toUpperCase(),
            category: (f.category || "LOGIC").toUpperCase(),
            summary: f.description || f.summary || "No description.",
            issue_reference: f.issue_reference || "General compliance gap.",
            remediation_strategy: f.remediation_strategy || f.fix || "Standard remediation.",
            implementation_steps: Array.isArray(f.implementation_steps)
                ? f.implementation_steps
                : [f.implementation_steps || "Check code manually."],
            jurisdiction: f.affected_jurisdiction || "Global",
            effort: f.implementation_difficulty || "Medium",
            impact: f.expected_impact || "Medium"
        }));

        setFixes(mapped);
        if (mapped.length > 0) setExpandedFix(mapped[0].id);
    };

    // --- Computed ---

    const filteredFixes = useMemo(() => {
        if (filterSeverity === "ALL") return fixes;
        return fixes.filter(f => f.severity === filterSeverity);
    }, [fixes, filterSeverity]);

    const metrics: Metrics = useMemo(() => {
        return {
            total: fixes.length,
            critical: fixes.filter(f => f.severity === "CRITICAL").length,
            high: fixes.filter(f => f.severity === "HIGH").length,
            effort: fixes.filter(f => f.effort === "High").length > 2 ? "High" : "Moderate"
        };
    }, [fixes]);

    // --- Helpers ---

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedStep(index);
        setTimeout(() => setCopiedStep(null), 2000);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "CRITICAL": return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50";
            case "HIGH": return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50";
            case "MEDIUM": return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50";
            default: return "text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "UI": return <LayoutGrid className="w-4 h-4" />;
            case "DATA": return <Database className="w-4 h-4" />;
            case "SECURITY": return <Lock className="w-4 h-4" />;
            case "LOGIC": return <Cpu className="w-4 h-4" />;
            default: return <Wrench className="w-4 h-4" />;
        }
    };

    // --- Render Loading / Generating ---

    if (status === "LOADING" || status === "GENERATING") {
        return (
            <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="relative mx-auto w-32 h-32">
                        {/* Blueprint Grid Background */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20" />

                        <div className="absolute inset-0 border-2 border-dashed border-teal/20 rounded-full animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-4 border-2 border-teal/30 rounded-full animate-[spin_5s_linear_infinite_reverse]" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <Wrench className="w-12 h-12 text-teal animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-serif text-3xl text-teal dark:text-parchment">
                            {status === "GENERATING" ? "Architecting Solutions" : "Loading Blueprints"}
                        </h2>
                        <div className="space-y-2">
                            <div className="h-1 w-full bg-charcoal/10 dark:bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-teal"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                            </div>
                            <p className="text-sm font-mono text-slate/50 uppercase tracking-widest">
                                {status === "GENERATING" ? "Agent: Engineering_Corps_01" : "Fetching System Context..."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Render Main Content ---

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment font-sans selection:bg-teal/20">

            {/* 1. Navbar */}
            <header className="px-6 py-4 border-b border-charcoal/5 dark:border-white/5 flex justify-between items-center bg-parchment/50 dark:bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/verdict?run_id=${runId}&feature_id=${featureId}`}
                        className="p-2 hover:bg-teal/5 rounded-lg transition-colors group"
                    >
                        <ChevronLeft className="w-5 h-5 text-teal group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="h-6 w-px bg-charcoal/10 dark:bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-teal" />
                        <span className="font-serif text-lg font-bold tracking-tight text-teal dark:text-parchment">
                            JurAI Remediation
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-teal transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Plan
                    </button>
                    <div className="px-3 py-1 bg-teal/5 rounded-full border border-teal/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-teal font-bold">
                            Live Build
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8">

                {/* 2. Hero & Metrics */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="mb-12 space-y-8"
                >
                    <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-teal/10 to-blue-500/10 rounded-2xl mb-2 border border-teal/10 shadow-sm">
                            <Wrench className="w-8 h-8 text-teal" />
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl text-teal dark:text-parchment tracking-tight">
                            Engineering Remediation
                        </h1>
                        <p className="text-lg text-slate/60 dark:text-slate/40 font-light leading-relaxed">
                            {executiveSummary}
                        </p>
                    </motion.div>

                    {/* Metrics Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Fixes", value: metrics.total, icon: ListIcon, color: "text-blue-500" },
                            { label: "Critical Gaps", value: metrics.critical, icon: AlertCircle, color: "text-red-500" },
                            { label: "High Priority", value: metrics.high, icon: Zap, color: "text-amber-500" },
                            { label: "Est. Effort", value: metrics.effort, icon: Clock, color: "text-teal" },
                        ].map((m, i) => (
                            <div key={i} className="bg-white dark:bg-[#151515] border border-charcoal/5 dark:border-white/5 p-4 rounded-xl shadow-sm flex items-center gap-4">
                                <div className={cn("p-2 rounded-lg bg-opacity-10", m.color.replace("text", "bg"))}>
                                    <m.icon className={cn("w-5 h-5", m.color)} />
                                </div>
                                <div>
                                    <div className="text-2xl font-serif font-bold text-charcoal dark:text-parchment">
                                        {m.value}
                                    </div>
                                    <div className="text-xs font-mono uppercase tracking-wider text-slate/40">
                                        {m.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* 3. Controls & Filter */}
                <div className="sticky top-20 z-40 bg-parchment/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md py-4 mb-6 border-b border-charcoal/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                        <Filter className="w-4 h-4 text-slate/40 mr-2" />
                        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                            <button
                                key={sev}
                                onClick={() => setFilterSeverity(sev)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition-all",
                                    filterSeverity === sev
                                        ? "bg-teal text-white border-teal shadow-md shadow-teal/20"
                                        : "bg-white dark:bg-[#151515] text-slate-500 border-charcoal/10 hover:border-teal/50"
                                )}
                            >
                                {sev}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 border border-charcoal/10 dark:border-white/10 rounded-lg p-1 bg-white dark:bg-[#151515]">
                        <button
                            onClick={() => setViewMode("LIST")}
                            className={cn("p-1.5 rounded-md transition-all", viewMode === "LIST" ? "bg-charcoal/5 dark:bg-white/10 text-teal" : "text-slate/40")}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("GRID")}
                            className={cn("p-1.5 rounded-md transition-all", viewMode === "GRID" ? "bg-charcoal/5 dark:bg-white/10 text-teal" : "text-slate/40")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 4. Fix List / Grid */}
                <motion.div
                    layout
                    className={cn(
                        "grid gap-6",
                        viewMode === "GRID" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"
                    )}
                >
                    <AnimatePresence>
                        {filteredFixes.map((fix) => {
                            const isOpen = expandedFix === fix.id && viewMode === "LIST";
                            const severityStyle = getSeverityColor(fix.severity);

                            return (
                                <motion.div
                                    layout
                                    key={fix.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={cn(
                                        "bg-white dark:bg-[#151515] border rounded-xl overflow-hidden transition-all duration-300 group",
                                        isOpen ? "ring-2 ring-teal/20 border-teal/40 shadow-xl" : "border-charcoal/10 dark:border-white/10 hover:border-teal/30 hover:shadow-md"
                                    )}
                                >
                                    {/* Fix Header (Clickable) */}
                                    <div
                                        onClick={() => viewMode === "LIST" && setExpandedFix(isOpen ? null : fix.id)}
                                        className={cn(
                                            "p-5 cursor-pointer flex flex-col sm:flex-row gap-4 relative overflow-hidden",
                                            !isOpen && "hover:bg-charcoal/[0.01]"
                                        )}
                                    >
                                        {/* Severity Strip */}
                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", severityStyle.split(" ")[1])} />

                                        {/* Header Content */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border", severityStyle)}>
                                                    {fix.severity}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs font-mono text-slate/50">
                                                    {getCategoryIcon(fix.category)}
                                                    <span>{fix.category}</span>
                                                </div>
                                                <span className="text-xs font-mono text-slate/30 ml-auto">
                                                    {fix.id}
                                                </span>
                                            </div>

                                            <h3 className="font-serif text-xl text-charcoal dark:text-parchment font-medium group-hover:text-teal transition-colors pr-8">
                                                {fix.title}
                                            </h3>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 pr-4">
                                                {fix.summary}
                                            </p>

                                            {/* Mini Metrics (Visible when collapsed) */}
                                            {!isOpen && (
                                                <div className="flex items-center gap-4 pt-2">
                                                    <div className="flex items-center gap-1 text-xs text-slate/40">
                                                        <Clock className="w-3 h-3" />
                                                        {fix.effort} Effort
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-slate/40">
                                                        <Activity className="w-3 h-3" />
                                                        {fix.impact} Impact
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expand Chevron */}
                                        {viewMode === "LIST" && (
                                            <div className="hidden sm:flex items-center justify-center">
                                                <div className={cn(
                                                    "p-2 rounded-full transition-all duration-300",
                                                    isOpen ? "bg-teal text-white rotate-180" : "bg-charcoal/5 dark:bg-white/5 text-slate/40 group-hover:bg-teal/10 group-hover:text-teal"
                                                )}>
                                                    <ChevronDown className="w-5 h-5" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Body */}
                                    <AnimatePresence>
                                        {(isOpen || viewMode === "GRID") && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-charcoal/5 dark:border-white/5 bg-charcoal/[0.02] dark:bg-[#111]"
                                            >
                                                <div className="p-5 space-y-6">

                                                    {/* Context Grid */}
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {/* Problem */}
                                                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 space-y-2">
                                                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                                <AlertCircle className="w-4 h-4" />
                                                                <span className="text-xs font-mono uppercase font-bold">Risk Context</span>
                                                            </div>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                {fix.issue_reference}
                                                            </p>
                                                        </div>

                                                        {/* Strategy */}
                                                        <div className="bg-teal/5 border border-teal/10 rounded-lg p-4 space-y-2">
                                                            <div className="flex items-center gap-2 text-teal">
                                                                <Zap className="w-4 h-4" />
                                                                <span className="text-xs font-mono uppercase font-bold">Technical Strategy</span>
                                                            </div>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                                                {fix.remediation_strategy}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Implementation Steps (The "Code" Part) */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2 text-slate/50">
                                                                <GitBranch className="w-4 h-4" />
                                                                <span className="text-xs font-mono uppercase tracking-widest">Implementation Sequence</span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white dark:bg-[#0A0A0A] border border-charcoal/10 dark:border-white/10 rounded-lg divide-y divide-charcoal/5 dark:divide-white/5 overflow-hidden">
                                                            {fix.implementation_steps.map((step, idx) => (
                                                                <div key={idx} className="group/step p-3 flex gap-3 hover:bg-teal/[0.02] transition-colors relative">
                                                                    <span className="flex-shrink-0 w-6 h-6 rounded-md bg-charcoal/5 dark:bg-white/10 flex items-center justify-center text-[10px] font-mono text-slate/50">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <p className="text-sm font-mono text-slate-600 dark:text-slate-300 pt-0.5 w-full pr-8">
                                                                        {step}
                                                                    </p>

                                                                    {/* Copy Button */}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleCopy(step, idx); }}
                                                                        className="absolute right-2 top-2 p-1.5 rounded hover:bg-charcoal/5 text-slate/30 hover:text-teal opacity-0 group-hover/step:opacity-100 transition-opacity"
                                                                    >
                                                                        {copiedStep === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Card Footer */}
                                                    <div className="flex items-center justify-between pt-2 border-t border-charcoal/5 dark:border-white/5">
                                                        <div className="flex gap-4">
                                                            <div className="text-xs text-slate/40">
                                                                <span className="font-bold">Jurisdiction:</span> {fix.jurisdiction}
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="flex items-center gap-2 text-xs font-medium text-teal hover:underline decoration-teal/50 underline-offset-4"
                                                            onClick={(e) => { e.stopPropagation(); /* Logic for modal */ }}
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                            View Tech Spec
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Empty State */}
                    {filteredFixes.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-charcoal/10 rounded-xl">
                            <div className="inline-flex p-4 rounded-full bg-charcoal/5 mb-4">
                                <Filter className="w-6 h-6 text-slate/40" />
                            </div>
                            <h3 className="font-serif text-xl text-slate-500">No fixes match this filter</h3>
                            <button
                                onClick={() => setFilterSeverity("ALL")}
                                className="mt-4 text-sm text-teal font-medium hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* 5. Footer Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 pb-12 flex flex-col sm:flex-row justify-center gap-4"
                >
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="px-8 py-4 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-xl font-medium text-charcoal dark:text-parchment hover:bg-charcoal/5 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Download className="w-5 h-5" />
                        Download Full Report
                    </button>
                    <Link
                        href="/"
                        className="px-8 py-4 bg-teal text-parchment rounded-xl font-serif text-lg hover:bg-teal/90 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-teal/20"
                    >
                        <Home className="w-5 h-5" />
                        Return to Dashboard
                    </Link>
                </motion.div>

            </main>

            {/* Background Texture */}
            <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.02] dark:opacity-[0.04]">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            {/* Export Modal (Simple) */}
            <AnimatePresence>
                {showExportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-[#151515] p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-teal/20"
                        >
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-teal" />
                                </div>
                                <h3 className="font-serif text-2xl">Export Ready</h3>
                                <p className="text-sm text-slate-500">
                                    Your remediation plan has been compiled into a PDF with {fixes.length} technical tasks.
                                </p>
                                <div className="pt-4 grid gap-2">
                                    <button
                                        onClick={() => setShowExportModal(false)}
                                        className="w-full py-3 bg-teal text-white rounded-lg font-medium hover:bg-teal/90"
                                    >
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={() => setShowExportModal(false)}
                                        className="w-full py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}