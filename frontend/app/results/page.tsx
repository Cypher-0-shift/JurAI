"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Scale,
    ChevronLeft,
    ChevronDown,
    AlertTriangle,
    Shield,
    FileText,
    Home,
    Download,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ComplianceIssue {
    severity: "HIGH" | "MEDIUM" | "LOW";
    title: string;
    summary: string;
    problem: string;
    fix: string;
    steps: string[];
}

// Sample compliance issues data
const SAMPLE_ISSUES: ComplianceIssue[] = [
    {
        severity: "HIGH",
        title: "Explicit Consent Missing",
        summary: "Analytics initialize before user opt-in.",
        problem: "The application initializes tracking scripts before obtaining user consent, violating GDPR Article 6 (Lawfulness of Processing) and Article 7 (Conditions for Consent). This creates immediate liability exposure in EU markets and potential fines up to 4% of global annual revenue.",
        fix: "Implement strict opt-in gating for all non-essential trackers and analytics services.",
        steps: [
            "Wrap all tracker initialization code in a consent check function",
            "Deploy a Consent Management Platform (CMP) banner on first page load",
            "Fire analytics events only after explicit 'accept' event is captured",
            "Store consent preferences in localStorage with timestamp",
            "Implement consent withdrawal mechanism in user settings"
        ]
    },
    {
        severity: "HIGH",
        title: "Data Retention Limit Exceeded",
        summary: "User data stored indefinitely without justification.",
        problem: "Current data retention policy stores personal information indefinitely without documented business justification, violating GDPR Article 5(1)(e) (Storage Limitation Principle). This creates unnecessary risk exposure and increases breach impact surface area.",
        fix: "Implement automated data retention policies with documented retention periods for each data category.",
        steps: [
            "Audit all data stores and categorize personal data types",
            "Define retention periods based on legitimate business needs",
            "Implement automated deletion jobs for expired data",
            "Create audit logs for all deletion operations",
            "Document retention policy in privacy policy and internal compliance docs"
        ]
    },
    {
        severity: "MEDIUM",
        title: "Right to Erasure Mechanism Missing",
        summary: "No self-service data deletion workflow available.",
        problem: "Users lack a clear mechanism to exercise their Right to Erasure (GDPR Article 17), requiring manual intervention for deletion requests. This creates operational burden and potential non-compliance if requests are not processed within 30 days.",
        fix: "Build a self-service account deletion workflow with cascading data removal.",
        steps: [
            "Create 'Delete Account' option in user settings",
            "Implement cascading deletion across all data stores",
            "Send confirmation email before final deletion",
            "Provide 30-day grace period for account recovery",
            "Generate deletion confirmation receipt for user records"
        ]
    },
    {
        severity: "MEDIUM",
        title: "Cross-Border Data Transfer Unprotected",
        summary: "Data transferred to US servers without adequate safeguards.",
        problem: "Personal data is transferred from EU to US-based servers without implementing Standard Contractual Clauses (SCCs) or other valid transfer mechanisms post-Schrems II. This violates GDPR Chapter V requirements for international data transfers.",
        fix: "Implement Standard Contractual Clauses and conduct Transfer Impact Assessment.",
        steps: [
            "Execute SCCs with all US-based service providers",
            "Conduct Transfer Impact Assessment (TIA) for each vendor",
            "Implement supplementary measures (encryption in transit and at rest)",
            "Document transfer mechanisms in Records of Processing Activities (ROPA)",
            "Update privacy policy to disclose international transfers"
        ]
    },
    {
        severity: "LOW",
        title: "Privacy Policy Accessibility Issue",
        summary: "Privacy policy not accessible from all user touchpoints.",
        problem: "Privacy policy is not consistently linked from all data collection points (signup, checkout, contact forms), creating transparency gaps that may violate GDPR Article 13 (Information to be provided where personal data are collected).",
        fix: "Ensure privacy policy is linked at every point of data collection.",
        steps: [
            "Audit all forms and data collection interfaces",
            "Add privacy policy link to all signup/login flows",
            "Include policy link in email footers",
            "Implement 'just-in-time' privacy notices for sensitive data collection",
            "Add privacy policy version number and last updated date"
        ]
    }
];

export default function ResultsPage() {
    const [openIssueIndex, setOpenIssueIndex] = useState<number | null>(null);

    const toggleIssue = (index: number) => {
        setOpenIssueIndex(openIssueIndex === index ? null : index);
    };

    const getSeverityColor = (severity: ComplianceIssue["severity"]) => {
        switch (severity) {
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
        }
    };

    const handleExportPDF = () => {
        // Placeholder for PDF export functionality
        alert("PDF export functionality will be implemented in the next phase.");
    };

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment">
            {/* Header */}
            <header className="px-6 py-6 border-b border-charcoal/5 dark:border-white/5 flex justify-between items-center bg-parchment/50 dark:bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-teal/5 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-teal" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-teal" />
                        <span className="font-serif text-lg font-bold tracking-tight text-teal dark:text-parchment">JurAI</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate/50">Compliance Report</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal/5 border border-teal/20 rounded-full mb-4">
                        <Shield className="w-4 h-4 text-teal" />
                        <span className="text-xs font-mono uppercase tracking-widest text-teal">Analysis Complete</span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl text-teal dark:text-parchment tracking-tight">
                        Recommended Compliance Fixes
                    </h1>
                    <p className="text-lg text-slate/60 dark:text-slate/40 max-w-2xl mx-auto font-light">
                        Actionable engineering steps to mitigate identified risks.
                    </p>
                    <div className="w-24 h-1 bg-gold/30 mx-auto rounded-full mt-6" />
                </motion.div>

                {/* Compliance Issues Accordion */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-serif text-2xl text-teal dark:text-parchment">Identified Issues</h2>
                        <span className="text-sm text-slate/50 font-mono">{SAMPLE_ISSUES.length} items</span>
                    </div>

                    <div className="space-y-3">
                        {SAMPLE_ISSUES.map((issue, index) => {
                            const isOpen = openIssueIndex === index;
                            const colors = getSeverityColor(issue.severity);

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm overflow-hidden"
                                >
                                    {/* Collapsed Header */}
                                    <button
                                        onClick={() => toggleIssue(index)}
                                        className="w-full p-6 flex items-center justify-between hover:bg-charcoal/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1 text-left">
                                            {/* Risk Badge */}
                                            <div className={cn("px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider", colors.badge)}>
                                                {issue.severity}
                                            </div>

                                            {/* Issue Info */}
                                            <div className="flex-1">
                                                <h3 className="font-medium text-lg text-charcoal dark:text-parchment mb-1">
                                                    {issue.title}
                                                </h3>
                                                <p className="text-sm text-slate/60 dark:text-slate/40 font-light">
                                                    {issue.summary}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Chevron */}
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
                                                transition={{ duration: 0.3, ease: "circOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 space-y-6 border-t border-charcoal/5 dark:border-white/5 pt-6">
                                                    {/* Why This Is A Problem */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <AlertCircle className={cn("w-4 h-4", colors.icon)} />
                                                            <h4 className="text-xs font-mono uppercase tracking-widest text-teal">
                                                                Why This Is A Problem
                                                            </h4>
                                                        </div>
                                                        <p className="text-sm text-slate/70 dark:text-slate/40 leading-relaxed font-light">
                                                            {issue.problem}
                                                        </p>
                                                    </div>

                                                    {/* Recommended Fix */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <CheckCircle2 className="w-4 h-4 text-teal" />
                                                            <h4 className="text-xs font-mono uppercase tracking-widest text-teal">
                                                                Recommended Fix
                                                            </h4>
                                                        </div>
                                                        <p className="text-sm text-charcoal dark:text-parchment font-medium">
                                                            {issue.fix}
                                                        </p>
                                                    </div>

                                                    {/* Implementation Steps */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <FileText className="w-4 h-4 text-teal" />
                                                            <h4 className="text-xs font-mono uppercase tracking-widest text-teal">
                                                                Implementation Steps
                                                            </h4>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {issue.steps.map((step, stepIndex) => (
                                                                <li key={stepIndex} className="flex items-start gap-3">
                                                                    <span className="text-teal/40 text-xs mt-1">•</span>
                                                                    <span className="text-sm text-slate/70 dark:text-slate/40 font-light flex-1">
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
                    className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm p-8 space-y-8"
                >
                    <div>
                        <h2 className="font-serif text-3xl text-teal dark:text-parchment mb-2">Executive Summary</h2>
                        <p className="text-xs font-mono uppercase tracking-widest text-gold">
                            Generated by JurAI Intelligence
                        </p>
                    </div>

                    {/* What JurAI Understood */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-teal border-b border-charcoal/5 dark:border-white/5 pb-2">
                            What JurAI Understood
                        </h3>
                        <p className="text-sm text-slate/70 dark:text-slate/40 leading-relaxed font-light">
                            Your application is a multi-region SaaS platform that collects and processes personal user data,
                            including text messages, usage analytics, and personal identifiers. The system operates across EU,
                            US, and India jurisdictions with AI-powered features that affect user experience through content
                            ranking and recommendations. Data is currently stored for 6-12 months with user consent obtained
                            via opt-out mechanism.
                        </p>
                    </div>

                    {/* Compliance Issues Identified */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-teal border-b border-charcoal/5 dark:border-white/5 pb-2">
                            Compliance Issues Identified
                        </h3>
                        <div className="space-y-3">
                            {SAMPLE_ISSUES.map((issue, index) => {
                                const colors = getSeverityColor(issue.severity);
                                return (
                                    <div key={index} className="flex items-center justify-between py-2">
                                        <span className="text-sm text-slate/70 dark:text-slate/40 font-light">
                                            {issue.title}
                                        </span>
                                        <div className={cn("px-2 py-1 rounded-full border text-[10px] font-mono uppercase tracking-wider", colors.badge)}>
                                            {issue.severity}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>

                {/* Suggested Remediation Plan */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="space-y-6"
                >
                    <h2 className="font-serif text-3xl text-teal dark:text-parchment">Suggested Remediation Plan</h2>

                    <div className="bg-teal/5 border border-teal/20 rounded-sm p-6 space-y-4">
                        <p className="text-sm text-slate/70 dark:text-slate/40 leading-relaxed font-light">
                            <strong className="text-charcoal dark:text-parchment font-medium">Priority Order:</strong> Address
                            HIGH severity issues immediately (consent mechanism and data retention), followed by MEDIUM severity
                            items (erasure workflow and cross-border transfers) within 30 days. LOW severity issues should be
                            resolved in the next product cycle.
                        </p>

                        <p className="text-sm text-slate/70 dark:text-slate/40 leading-relaxed font-light">
                            <strong className="text-charcoal dark:text-parchment font-medium">Engineering Tasks Required:</strong> Implementation
                            will require frontend consent management integration, backend data retention automation, self-service
                            deletion API endpoints, and legal documentation updates. Estimated engineering effort: 3-4 sprint cycles.
                        </p>

                        <p className="text-sm text-slate/70 dark:text-slate/40 leading-relaxed font-light">
                            <strong className="text-charcoal dark:text-parchment font-medium">System-Level Changes:</strong> Deploy
                            Consent Management Platform (CMP), implement automated data lifecycle policies, establish Standard
                            Contractual Clauses with vendors, and create comprehensive audit logging infrastructure.
                        </p>
                    </div>
                </motion.section>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                >
                    <button
                        onClick={handleExportPDF}
                        className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 text-charcoal dark:text-parchment font-medium rounded-sm hover:bg-charcoal/5 dark:hover:bg-white/5 transition-all w-full sm:w-auto"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export as PDF
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

            {/* Background Decoration */}
            <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.02] dark:opacity-[0.05]">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal via-transparent to-transparent" />
            </div>
        </div>
    );
}