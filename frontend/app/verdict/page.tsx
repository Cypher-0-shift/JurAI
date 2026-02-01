"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Scale,
    Shield,
    Gavel,
    FileText,
    Activity,
    Brain,
    Clock,
    BookOpen,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    X,
    FileCode,
    Globe,
    Scale as ScaleIcon,
    CheckCircle,
    XCircle,
    ClipboardCheck,
    Download,
    Zap,
    TrendingUp,
    ShieldAlert,
    Lock,
    Users,
    Target,
    Award
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { TabNavigation } from "@/components/TabNavigation";

export default function VerdictPage() {
    const searchParams = useSearchParams();
    const runId = searchParams.get("run_id");
    const featureId = searchParams.get("feature_id");

    const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
    const [expandedEvidence, setExpandedEvidence] = useState<number | null>(null);
    const [showLegalDoc, setShowLegalDoc] = useState(false);

    // State for Dynamic Data
    const [detectedIssues, setDetectedIssues] = useState<any[]>([]);
    const [legalEvidences, setLegalEvidences] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        confidence: 0,
        riskScore: 0,
        criticalCount: 0,
        totalCount: 0,
        time: "0:00"
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            // 1. Handle Missing IDs (Loading State instead of Mock Data)
            if (!runId || !featureId) {
                console.warn("Missing run_id or feature_id");
                setIsLoading(false);
                return;
            }

            try {
                // 2. Fetch from Backend
                const result = await api.pipeline.getResults(featureId, runId);

                // 3. PARSING LOGIC: Handle cases where verdict is a JSON string or an Object
                let verdictData: any = {};

                if (result.verdict) {
                    if (typeof result.verdict === 'string') {
                        try {
                            // Clean markdown code blocks if present (e.g. ```json ... ```)
                            const cleanJson = result.verdict.replace(/```json/g, '').replace(/```/g, '').trim();
                            verdictData = JSON.parse(cleanJson);
                        } catch (e) {
                            console.error("Failed to parse verdict JSON string:", e);
                            // Fallback: Use the raw string as a description if parsing fails
                            verdictData = { issues: [], summary: result.verdict };
                        }
                    } else {
                        verdictData = result.verdict;
                    }
                }

                const trace = result.agent_trace || [];

                // 4. Calculate Analysis Time (from agent trace timestamps)
                let durationStr = "0:00";
                if (trace.length > 1) {
                    try {
                        const start = new Date(trace[0].timestamp).getTime();
                        const end = new Date(trace[trace.length - 1].timestamp).getTime();
                        const diffMs = end - start;
                        if (!isNaN(diffMs)) {
                            const minutes = Math.floor(diffMs / 60000);
                            const seconds = Math.floor((diffMs % 60000) / 1000);
                            durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        }
                    } catch (e) {
                        console.error("Date parsing error", e);
                    }
                }

                // 5. Map Metrics
                // Prefer Risk Assessment pipeline data if available, otherwise fall back to Verdict data
                const riskData = result.risk_assessment || {};

                // Try to get risk score from Risk Pipeline -> then Verdict -> then Default
                let calculatedRisk = 50; // Default
                if (riskData.risk_score !== undefined) calculatedRisk = riskData.risk_score;
                else if (riskData.overall_risk_score !== undefined) calculatedRisk = riskData.overall_risk_score;
                else if (verdictData.risk_score !== undefined) calculatedRisk = verdictData.risk_score;
                else if (verdictData.compliance_score !== undefined) calculatedRisk = 100 - verdictData.compliance_score;

                const overallRisk = calculatedRisk;
                const confidence = verdictData.confidence ? Math.round(verdictData.confidence * 100) : 85;

                // 6. Map Issues (Standardize Schema)
                const issues: any[] = [];
                const rawIssues = Array.isArray(verdictData.issues) ? verdictData.issues : [];

                rawIssues.forEach((issue: any, iIdx: number) => {
                    issues.push({
                        id: `issue-${iIdx}`,
                        title: issue.title || "Compliance Observation",
                        description: issue.description || issue.summary || "Details not provided by Jury.",
                        severity: issue.severity || "Medium",
                        riskScore: issue.risk_score || overallRisk,
                        category: issue.category || "General",
                        impact: issue.impact || "Potential regulatory gap.",
                        remediation: issue.remediation || issue.fix_suggestion || "Review compliance guidelines."
                    });
                });

                // 7. Map Evidence
                const evidences: any[] = [];
                const rawEvidence = Array.isArray(verdictData.evidence_cited) ? verdictData.evidence_cited : [];

                rawEvidence.forEach((ev: any, eIdx: number) => {
                    evidences.push({
                        id: `ev-top-${eIdx}`,
                        title: ev.source || ev.title || "Legal Reference",
                        description: `Citation: ${ev.citation || 'N/A'}`,
                        reference: ev.citation || "General Reference",
                        severity: "Medium", // Evidence itself doesn't always have severity, default to Medium
                        category: "Regulation",
                        content: ev.content || ev.snippet || ev.text || "No text content available.",
                        riskScore: overallRisk,
                        frameworks: ev.frameworks || [],
                        jurisdiction: ev.jurisdiction || "Global"
                    });
                });

                // Update State
                setDetectedIssues(issues);
                setLegalEvidences(evidences);
                setMetrics({
                    confidence: confidence,
                    riskScore: Math.round(overallRisk),
                    criticalCount: issues.filter(i => (i.severity || "").toLowerCase() === "high" || (i.severity || "").toLowerCase() === "critical").length,
                    totalCount: issues.length,
                    time: durationStr
                });

            } catch (error) {
                console.error("Failed to fetch verdict results:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [runId, featureId]);

    const isValidObject = (obj: any) => obj && typeof obj === 'object';

    // Helper for rendering
    const totalIssues = detectedIssues.length;
    const criticalIssues = metrics.criticalCount;

    const openLegalDocument = (evidence: any) => {
        setSelectedEvidence(evidence);
        setShowLegalDoc(true);
    };

    const closeLegalDocument = () => {
        setShowLegalDoc(false);
        setSelectedEvidence(null);
    };

    const toggleEvidence = (id: number) => {
        setExpandedEvidence(expandedEvidence === id ? null : id);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-teal font-serif text-xl animate-pulse">Loading JurAI Analysis...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment">

            {/* Header */}
            <header className="sticky top-0 z-50 px-6 py-4 border-b border-charcoal/10 dark:border-white/10 bg-parchment/90 dark:bg-[#0A0A0A]/90 backdrop-blur-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Scale className="w-6 h-6 text-teal" />
                        <div>
                            <h1 className="font-serif text-xl font-bold text-teal">JurAI Verdict</h1>
                            <p className="text-xs font-mono text-slate/40">Final Assessment Report</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <TabNavigation activeTab="verdict" />

                {/* Metrics Section */}
                <div className="mb-12">
                    <h2 className="font-serif text-2xl text-teal mb-6">Case Overview</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-teal/10 rounded-lg">
                                    <Target className="w-5 h-5 text-teal" />
                                </div>
                                <div>
                                    <div className="text-2xl font-serif text-teal">{metrics.confidence}%</div>
                                    <div className="text-sm font-mono text-slate/40">Confidence</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <div className="text-xl font-serif">{metrics.time}</div>
                                    <div className="text-sm font-mono text-slate/40">Analysis Time</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <div className="text-2xl font-serif text-red-500">{criticalIssues}</div>
                                    <div className="text-sm font-mono text-slate/40">Critical Issues</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <ScaleIcon className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <div className="text-xl font-serif">{totalIssues}</div>
                                    <div className="text-sm font-mono text-slate/40">Total Issues</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#151515] border border-teal/20 rounded-lg p-6">
                        <h3 className="font-serif text-lg text-teal mb-3">Frameworks Analyzed</h3>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(legalEvidences.flatMap(e => e.frameworks || [e.jurisdiction]))).map((framework: any) => (
                                <span
                                    key={framework}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/10 text-sm font-mono rounded-full"
                                >
                                    {framework}
                                </span>
                            ))}
                            {legalEvidences.length === 0 && <span className="text-slate/40 text-sm">No specific frameworks cited.</span>}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Left Column - Detected Issues */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-2xl text-teal flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" />
                                Detected Issues
                            </h2>
                            <span className="text-sm font-mono text-slate/40">
                                {totalIssues} total
                            </span>
                        </div>

                        <div className="space-y-4">
                            {detectedIssues.map((issue) => (
                                <div
                                    key={issue.id}
                                    className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-lg p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "px-2 py-1 text-xs font-mono rounded",
                                                issue.severity === "Critical" ? "bg-red-500/10 text-red-500" :
                                                    issue.severity === "High" ? "bg-amber-500/10 text-amber-500" :
                                                        "bg-blue-500/10 text-blue-500"
                                            )}>
                                                {issue.severity}
                                            </span>
                                            <span className="text-sm font-mono text-slate/40">{issue.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-serif text-teal">{issue.riskScore}%</div>
                                        </div>
                                    </div>

                                    <h3 className="font-serif text-lg mb-2">{issue.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-4">{issue.description}</p>

                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <Zap className="w-4 h-4 text-amber-500 mt-0.5" />
                                            <span className="text-sm">{issue.impact}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <ClipboardCheck className="w-4 h-4 text-teal mt-0.5" />
                                            <span className="text-sm">{issue.remediation}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {detectedIssues.length === 0 && !isLoading && (
                                <div className="p-6 text-center text-slate-400 border border-dashed rounded-lg">
                                    No issues detected or analysis is incomplete.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Legal Evidence */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-2xl text-teal flex items-center gap-2">
                                <BookOpen className="w-6 h-6" />
                                Legal Evidence
                            </h2>
                            <span className="text-sm font-mono text-slate/40">
                                {legalEvidences.length} references
                            </span>
                        </div>

                        <div className="space-y-4">
                            {legalEvidences.map((evidence) => (
                                <div
                                    key={evidence.id}
                                    className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-lg overflow-hidden"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "px-2 py-1 text-xs font-mono rounded",
                                                    evidence.severity === "Critical" ? "bg-red-500/10 text-red-500" :
                                                        evidence.severity === "High" ? "bg-amber-500/10 text-amber-500" :
                                                            "bg-blue-500/10 text-blue-500"
                                                )}>
                                                    {evidence.severity}
                                                </span>
                                                <span className="text-sm font-mono text-slate/40">{evidence.category}</span>
                                            </div>
                                            <button
                                                onClick={() => toggleEvidence(evidence.id)}
                                                className="text-slate/40 hover:text-teal"
                                            >
                                                {expandedEvidence === evidence.id ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>

                                        <h3 className="font-serif text-lg mb-2">{evidence.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">{evidence.description}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-slate-500">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Globe className="w-4 h-4" />
                                                    {evidence.jurisdiction}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ScaleIcon className="w-4 h-4" />
                                                    {evidence.frameworks[0]}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-serif text-teal">{evidence.riskScore}%</div>
                                                <div className="text-xs font-mono text-slate/40">Relevance</div>
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedEvidence === evidence.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className="p-5 border-t border-charcoal/5 dark:border-white/5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="text-sm font-mono text-teal">
                                                            {evidence.reference}
                                                        </div>
                                                        <button
                                                            onClick={() => openLegalDocument(evidence)}
                                                            className="text-sm font-mono text-teal hover:text-teal/70 flex items-center gap-1"
                                                        >
                                                            <FileCode className="w-4 h-4" />
                                                            View Full Text
                                                        </button>
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                                                        {evidence.content.split('\n\n').map((paragraph: string, idx: number) => (
                                                            <p key={idx} className="leading-relaxed">
                                                                {paragraph}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fix Button Section */}
                <div className="bg-gradient-to-r from-teal/5 via-blue-500/5 to-purple-500/5 border border-teal/20 rounded-xl p-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-serif text-2xl text-teal mb-4">Ready to Fix Issues</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            All compliance issues have been identified. Generate automated fixes and compliance solutions.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <div className="text-center">
                                <div className="text-3xl font-serif text-teal mb-1">{Math.round(metrics.riskScore)}%</div>
                                <div className="text-sm font-mono text-slate/40">Current Risk</div>
                            </div>
                            <div className="hidden sm:block text-slate/40">→</div>
                            <div className="text-center">
                                <div className="text-3xl font-serif text-green-500 mb-1">
                                    {Math.max(0, Math.round(metrics.riskScore) - 70)}%
                                </div>
                                <div className="text-sm font-mono text-slate/40">After Fixes</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={`/fixes?run_id=${runId}&feature_id=${featureId}`}
                                className="inline-flex items-center justify-center px-8 py-3 bg-teal text-parchment font-serif text-lg rounded-lg hover:bg-teal/90 transition-colors"
                            >
                                <ClipboardCheck className="w-5 h-5 mr-2" />
                                Generate Compliance Fixes
                            </Link>
                            <button className="inline-flex items-center justify-center px-6 py-3 border border-blue-500/20 text-charcoal dark:text-parchment font-serif rounded-lg hover:border-teal/30 transition-colors">
                                <Download className="w-5 h-5 mr-2" />
                                Download Report
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Legal Document Modal */}
            <AnimatePresence>
                {showLegalDoc && selectedEvidence && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div
                            className="bg-white dark:bg-[#151515] rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-charcoal/10 dark:border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-serif text-xl mb-1">{selectedEvidence.title}</h3>
                                        <p className="text-sm text-slate/40">{selectedEvidence.reference}</p>
                                    </div>
                                    <button
                                        onClick={closeLegalDocument}
                                        className="p-2 hover:bg-charcoal/5 dark:hover:bg-white/10 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                    {selectedEvidence.content}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-charcoal/10 dark:border-white/10">
                                <button
                                    onClick={closeLegalDocument}
                                    className="w-full px-6 py-3 bg-teal text-parchment rounded-lg font-serif hover:bg-teal/90"
                                >
                                    Close Document
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}