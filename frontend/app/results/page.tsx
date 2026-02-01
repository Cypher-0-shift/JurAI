"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Copy,
    ExternalLink,
    Code,
    Shield,
    Gavel,
    BookOpen,
    ArrowRight
} from "lucide-react";

// Mock data for results - mimicking what might come from the backend/analysis
const MOCK_RESULTS = {
    overallScore: 72,
    status: "Needs Attention",
    issues: [
        {
            id: "issue-1",
            severity: "High",
            title: "Missing GDPR Cookie Consent",
            description: "The application sets cookies before obtaining explicit user consent, violating GDPR Article 6.",
            location: "Landing Page (/) - HTTP Headers",
            remediation: "Implement a cookie banner that blocks non-essential cookies until the user clicks 'Accept'.",
            reference: "GDPR Art 6(1)(a)",
            codeSnippet: `// Current:
document.cookie = "analytics_id=123";

// Recommended:
if (userConsented) {
  document.cookie = "analytics_id=123";
}`
        },
        {
            id: "issue-2",
            severity: "Medium",
            title: "Insecure Password Storage",
            description: "Passwords appear to be hashed with MD5 which is considered cryptographically broken.",
            location: "Backend / Auth Service",
            remediation: "Upgrade password hashing to Argon2 or bcrypt with a work factor of at least 10.",
            reference: "NIST SP 800-63B",
            codeSnippet: `// Current:
const hash = md5(password);

// Recommended:
const hash = await bcrypt.hash(password, 10);`
        },
        {
            id: "issue-3",
            severity: "Low",
            title: "Unclear Data Retention Policy",
            description: "The privacy policy does not specify how long user data is retained.",
            location: "Privacy Policy Page",
            remediation: "Add a section to the privacy policy clearly stating retention periods for different types of data.",
            reference: "GDPR Art 13(2)(a)",
            codeSnippet: null
        }
    ],
    passedChecks: [
        "HTTPS Encryption Enabled",
        "Content Security Policy Present",
        "No Hardcoded Secrets found"
    ]
};

export default function ResultsPage() {
    const [openIssue, setOpenIssue] = useState<string | null>(null);

    const toggleIssue = (id: string) => {
        setOpenIssue(openIssue === id ? null : id);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "high":
            case "critical":
                return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800";
            case "medium":
                return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800";
            case "low":
                return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
            default:
                return "text-slate-600 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700";
        }
    };

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment font-sans selection:bg-teal selection:text-white">
            {/* Header */}
            <header className="px-6 py-6 border-b border-charcoal/5 dark:border-white/5 flex justify-between items-center bg-parchment/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal text-white rounded-sm flex items-center justify-center">
                        <Gavel size={18} />
                    </div>
                    <span className="font-serif text-xl tracking-tight font-semibold">JurAI Analysis Results</span>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                    <div className="flex flex-col items-end">
                        <span className="text-slate/50 text-xs uppercase tracking-widest">Score</span>
                        <span className={`text-2xl font-serif leading-none ${MOCK_RESULTS.overallScore >= 80 ? 'text-green-600' : MOCK_RESULTS.overallScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {MOCK_RESULTS.overallScore}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">

                {/* Summary Section */}
                <section className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#151515] p-6 rounded-sm shadow-sm border border-charcoal/5 dark:border-white/5 md:col-span-2">
                        <h2 className="font-serif text-2xl mb-4 text-teal">Executive Summary</h2>
                        <p className="text-slate/70 dark:text-slate/30 mb-6 leading-relaxed">
                            The compliance analysis identified <strong className="text-charcoal dark:text-parchment">{MOCK_RESULTS.issues.length} potential issues</strong> that require attention.
                            The overall compliance score is <strong className="text-amber-600">{MOCK_RESULTS.overallScore}/100</strong>, indicating a {MOCK_RESULTS.status} status.
                            Priority fixes are recommended for high-severity violations to avoid regulatory penalties.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <span className="px-3 py-1 bg-teal/10 text-teal text-sm font-medium rounded-full border border-teal/20">
                                GDPR
                            </span>
                            <span className="px-3 py-1 bg-teal/10 text-teal text-sm font-medium rounded-full border border-teal/20">
                                NIST 800-63B
                            </span>
                            <span className="px-3 py-1 bg-teal/10 text-teal text-sm font-medium rounded-full border border-teal/20">
                                Best Practices
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#151515] p-6 rounded-sm shadow-sm border border-charcoal/5 dark:border-white/5">
                        <h3 className="font-serif text-lg mb-4 text-slate/60 dark:text-slate/40">Breakdown</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-sm"><AlertTriangle size={16} className="text-red-500" /> Critical/High</span>
                                <span className="font-mono font-bold">1</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[33%]"></div>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <span className="flex items-center gap-2 text-sm"><AlertTriangle size={16} className="text-amber-500" /> Medium</span>
                                <span className="font-mono font-bold">1</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full w-[33%]"></div>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <span className="flex items-center gap-2 text-sm"><AlertTriangle size={16} className="text-blue-500" /> Low</span>
                                <span className="font-mono font-bold">1</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-[33%]"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Issues List */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-serif text-2xl text-charcoal dark:text-parchment">Compliance Violations</h2>
                        <span className="text-sm text-slate/50">{MOCK_RESULTS.issues.length} Issues Found</span>
                    </div>

                    <div className="space-y-4">
                        {MOCK_RESULTS.issues.map((issue) => (
                            <motion.div
                                key={issue.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white dark:bg-[#151515] border rounded-sm overflow-hidden transition-all ${openIssue === issue.id ? 'shadow-md border-teal/30' : 'shadow-sm border-charcoal/5 dark:border-white/5'}`}
                            >
                                <div
                                    onClick={() => toggleIssue(issue.id)}
                                    className="p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className={`mt-1 shrink-0 px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded border ${getSeverityColor(issue.severity)}`}>
                                        {issue.severity}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-lg leading-tight mb-1">{issue.title}</h3>
                                            {openIssue === issue.id ? <ChevronUp size={20} className="text-slate/40" /> : <ChevronDown size={20} className="text-slate/40" />}
                                        </div>
                                        <p className="text-slate/60 dark:text-slate/40 text-sm line-clamp-1">{issue.description}</p>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {openIssue === issue.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-charcoal/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20"
                                        >
                                            <div className="p-6 space-y-6">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate/40 mb-2">Description</h4>
                                                        <p className="text-slate/80 dark:text-slate/20 leading-relaxed text-sm">
                                                            {issue.description}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate/40 mb-2">Location</h4>
                                                        <div className="flex items-center gap-2 text-sm font-mono text-slate/70 dark:text-slate/30 bg-white dark:bg-white/5 px-3 py-2 rounded border border-charcoal/5 dark:border-white/5">
                                                            <ExternalLink size={14} />
                                                            {issue.location}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate/40 mb-2">Remediation Suggestion</h4>
                                                    <div className="bg-teal/5 border border-teal/10 rounded-sm p-4 text-sm text-teal-900 dark:text-teal-100">
                                                        <div className="flex gap-2">
                                                            <CheckCircle2 size={16} className="text-teal shrink-0 mt-0.5" />
                                                            <p>{issue.remediation}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {issue.codeSnippet && (
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate/40 mb-2 flex items-center gap-2">
                                                            <Code size={14} /> Code Example
                                                        </h4>
                                                        <div className="bg-[#1e1e1e] text-gray-300 p-4 rounded-sm font-mono text-xs overflow-x-auto border border-white/10 relative group">
                                                            <pre>{issue.codeSnippet}</pre>
                                                            <button className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded text-slate/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                                                <Copy size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 pt-2 border-t border-charcoal/5 dark:border-white/5 mt-4">
                                                    <BookOpen size={14} className="text-slate/40" />
                                                    <span className="text-xs text-slate/50">Reference: <span className="font-medium text-slate/70 dark:text-slate/30">{issue.reference}</span></span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Passed Checks */}
                <section className="mb-12">
                    <h2 className="font-serif text-xl text-charcoal dark:text-parchment mb-4 opacity-80">Passed Checks</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        {MOCK_RESULTS.passedChecks.map((check, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-sm text-sm text-green-800 dark:text-green-300">
                                <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                                {check}
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
