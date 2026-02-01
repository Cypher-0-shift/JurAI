"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Scale,
    Shield,
    CheckCircle2,
    ChevronRight,
    Gavel,
    FileText,
    ExternalLink,
    Activity,
    Eye,
    MessageSquare,
    Brain,
    Clock,
    BookOpen,
    ScrollText,
    Search,
    Users,
    Hammer,
    Sparkles,
    Zap,
    Target,
    Award,
    LineChart
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// Three agents with detailed roles
const AGENTS = [
    {
        name: "Regulation Detective",
        title: "Juror",
        icon: Shield,
        id: "REG-001",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        ringColor: "ring-blue-500/20",
        position: { x: "left-8", y: "top-8" },
        role: "Analyzes regulatory compliance with GDPR, CCPA, and other data protection laws"
    },
    {
        name: "Design Counsel",
        title: "Critic",
        icon: Scale,
        id: "CRT-009",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        ringColor: "ring-purple-500/20",
        position: { x: "right-8", y: "top-8" },
        role: "Reviews UI/UX for dark patterns, accessibility issues, and deceptive practices"
    },
    {
        name: "Compliance Validator",
        title: "Judge",
        icon: Gavel,
        id: "JDG-100",
        color: "text-teal",
        bgColor: "bg-teal/10",
        borderColor: "border-teal/20",
        ringColor: "ring-teal/20",
        position: { x: "left-1/2", y: "top-8" },
        role: "Evaluates all evidence and delivers final legal verdict"
    },
];

// Enhanced conversation flow with detailed thought processes
const CONVERSATION_FLOW = [
    {
        agentId: "REG-001",
        message: "Initial regulatory scan initiated. Checking for GDPR, CCPA, and regional compliance standards...",
        duration: 1800,
        report: "Regulatory violations detected: 1) Inadequate data encryption, 2) Missing DPA, 3) Insufficient data retention policy",
        isThinking: true,
        highlight: false,
        thoughtProcess: [
            "Scanning data storage mechanisms...",
            "Checking encryption protocols for user data...",
            "Reviewing data processing agreements...",
            "Analyzing data retention policies...",
            "Cross-referencing with GDPR Article 32 requirements...",
            "Identifying compliance gaps in data protection..."
        ]
    },
    {
        agentId: "REG-001",
        message: "✓ GDPR Article 32 violation confirmed. Data at rest lacks AES-256 encryption. Risk score: 85%",
        duration: 2200,
        report: "Critical: Missing encryption for user data. Reference: GDPR Art. 32",
        passesTo: "CRT-009",
        highlight: true
    },
    {
        agentId: "CRT-009",
        message: "Received regulatory report. Now analyzing user interface for deceptive patterns and accessibility issues...",
        duration: 2000,
        report: "UI/UX audit initiated. Checking dark patterns, ADA compliance, and consumer protection standards",
        isThinking: true,
        highlight: false,
        thoughtProcess: [
            "Analyzing subscription flow for dark patterns...",
            "Checking cancellation process for deceptive elements...",
            "Reviewing button colors and placement...",
            "Evaluating cognitive load in decision-making...",
            "Cross-referencing with FTC Section 5(a) guidelines...",
            "Assessing UI transparency and user autonomy..."
        ]
    },
    {
        agentId: "CRT-009",
        message: "✓ Dark pattern detected in subscription flow. FTC Section 5(a) violation confirmed. Risk score: 62%",
        duration: 2500,
        report: "Deceptive UI: Confusing cancellation flow with biased button placement",
        passesTo: "REG-001",
        highlight: true
    },
    {
        agentId: "REG-001",
        message: "Additional finding: Missing Data Processing Agreement violates GDPR Article 28. Third-party analytics not compliant.",
        duration: 2100,
        report: "GDPR Art. 28 violation: No DPA with analytics provider",
        passesTo: "CRT-009",
        highlight: true
    },
    {
        agentId: "CRT-009",
        message: "✓ ADA Title III violation confirmed. Payment form lacks ARIA labels, creating accessibility barriers.",
        duration: 2300,
        report: "Accessibility failure: Screen reader users cannot complete transactions",
        passesTo: "JDG-100",
        highlight: true,
        thoughtProcess: [
            "Scanning form inputs for ARIA labels...",
            "Testing screen reader compatibility...",
            "Checking color contrast ratios...",
            "Evaluating keyboard navigation...",
            "Assessing form field descriptions...",
            "Reviewing error message accessibility..."
        ]
    },
    {
        agentId: "REG-001",
        message: "Privacy policy lacks specific retention periods. Violates GDPR's data minimization principle (Art. 5(1)(c)).",
        duration: 1900,
        report: "Data minimization failure: No defined retention periods",
        passesTo: "CRT-009",
        highlight: true
    },
    {
        agentId: "CRT-009",
        message: "Cookie consent mechanism violates ePrivacy Directive. Pre-ticked boxes fail 'freely given' requirement.",
        duration: 2400,
        report: "Cookie consent violation: Default opt-in instead of opt-out",
        passesTo: "JDG-100",
        highlight: true
    },
    {
        agentId: "JDG-100",
        message: "All evidence reviewed. Synthesizing findings from both agents. Preparing final compliance assessment...",
        duration: 3000,
        report: "Final deliberation: Aggregating 8 violations across 3 regulatory frameworks",
        isThinking: true,
        isFinal: true,
        highlight: false,
        thoughtProcess: [
            "Aggregating findings from Juror and Critic...",
            "Calculating overall compliance score...",
            "Prioritizing violations by severity...",
            "Reviewing regulatory precedence...",
            "Assessing potential legal penalties...",
            "Formulating remediation recommendations...",
            "Preparing final verdict summary..."
        ]
    }
];

export default function AnalysisPage() {
    const searchParams = useSearchParams();
    const runId = searchParams.get("run_id");
    const featureId = searchParams.get("feature_id");

    const [analyzing, setAnalyzing] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [conversationHistory, setConversationHistory] = useState<any[]>([]);
    const [showVerdictButton, setShowVerdictButton] = useState(false);
    const [activeThinker, setActiveThinker] = useState<string | null>(null);
    // const [analysisComplete, setAnalysisComplete] = useState(false); // Removed unused state
    const [currentReport, setCurrentReport] = useState<string | null>(null);
    const [activeAgent, setActiveAgent] = useState<string | null>(null);
    const [agentThoughts, setAgentThoughts] = useState<{ [key: string]: string[] }>({});
    const [realFlow, setRealFlow] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const thoughtRefs = {
        "REG-001": useRef<HTMLDivElement>(null),
        "CRT-009": useRef<HTMLDivElement>(null),
        "JDG-100": useRef<HTMLDivElement>(null)
    };

    // Auto-scroll to bottom of thought boxes when new thoughts are added
    useEffect(() => {
        if (activeThinker && thoughtRefs[activeThinker as keyof typeof thoughtRefs]?.current) {
            const thoughtBox = thoughtRefs[activeThinker as keyof typeof thoughtRefs].current;
            if (thoughtBox) {
                thoughtBox.scrollTop = thoughtBox.scrollHeight;
            }
        }
    }, [agentThoughts, activeThinker]);

    // 1. Fetch Data with Polling
    useEffect(() => {
        let isMounted = true;
        let pollInterval: NodeJS.Timeout;

        const fetchData = async () => {
            if (!runId || !featureId) {
                if (isMounted) {
                    setRealFlow(CONVERSATION_FLOW); // Use Mock
                    setIsLoadingData(false);
                }
                return;
            }

            try {
                const result = await api.pipeline.getResults(featureId, runId);
                const trace = result.agent_trace || [];
                const status = result.status;

                // Map Backend Trace to Frontend Flow
                const mappedFlow = trace.map((item: any) => {
                    let agentId = "REG-001"; // Default Jury
                    if (item.agent === "Critic_Reviewer") agentId = "CRT-009";
                    if (item.agent === "Judge") agentId = "JDG-100";

                    // Use actual logs if available, otherwise generic
                    let thoughts = item.logs && item.logs.length > 0
                        ? item.logs
                        : item.is_realtime
                            ? [`Processing step: ${item.step}...`]
                            : [`${item.agent} is processing context...`, `${item.agent} is generating response...`];

                    // Clean up logs for display
                    thoughts = thoughts.map((log: string) => {
                        if (log.startsWith("Calling Tool:")) return log.replace("Calling Tool:", "🛠️ Calling Tool:");
                        if (log.startsWith("Tool Result:")) return log.replace("Tool Result:", "✅ Tool Result:");
                        return `🤔 ${log}`;
                    });

                    return {
                        agentId,
                        message: `${item.agent}: ${item.step}`,
                        report: item.content,
                        duration: 3000,
                        isThinking: true,
                        thoughtProcess: thoughts,
                        isFinal: item.step === "Final Verdict"
                    };
                });

                if (isMounted) {
                    if (mappedFlow.length > 0) {
                        setRealFlow(mappedFlow);
                    }
                    setIsLoadingData(false);

                    // Stop polling if complete
                    if (status === "CORE_COMPLETED" || status === "FAILED" || status === "IMPORTED_VERDICT") {
                        clearInterval(pollInterval);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch results:", e);
                // Don't fallback to mock immediately on error during polling, just log
            }
        };

        // Initial Fetch
        fetchData();

        // Start Polling
        pollInterval = setInterval(fetchData, 2000);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, [runId, featureId]);


    // 2. Run Conversation Animation (Streaming Friendly)
    const processingRef = useRef(false);
    const lastProcessedIndexRef = useRef(-1);

    useEffect(() => {
        if (!analyzing || isLoadingData || realFlow.length === 0) return;
        if (processingRef.current) return; // Prevent concurrent loops

        const runConversation = async () => {
            processingRef.current = true;

            // Start from the next step
            let startIndex = lastProcessedIndexRef.current + 1;

            // If we have new steps to process
            if (startIndex < realFlow.length) {
                for (let i = startIndex; i < realFlow.length; i++) {
                    const step = realFlow[i];
                    setCurrentStep(i);
                    lastProcessedIndexRef.current = i; // Mark as processed
                    setActiveAgent(step.agentId);

                    // Show thinking state and add thoughts progressively
                    if (step.isThinking && step.thoughtProcess) {
                        setActiveThinker(step.agentId);

                        // Update report immediately if valid
                        if (step.report) {
                            setCurrentReport(step.report);
                        }

                        // Clear thoughts for this agent if it's a new block for them
                        // (Optional: depending on if we want to keep history per agent)
                        // setAgentThoughts(prev => ({
                        //     ...prev,
                        //     [step.agentId]: []
                        // }));

                        // Add thoughts one by one with delays
                        const thoughts = step.thoughtProcess || [];
                        // We only want to animate valid thoughts.
                        // If it's a completed step from backend w/o specific logs, it might be fast.

                        // If we are "catching up" (i.e., this step is old), speed it up
                        const isCatchingUp = i < realFlow.length - 1;
                        const stepDuration = isCatchingUp ? 500 : step.duration; // Faster catchup

                        for (let j = 0; j < thoughts.length; j++) {
                            // If catching up, barely wait
                            const delay = isCatchingUp ? 100 : (stepDuration * 0.7) / (thoughts.length || 1);
                            await new Promise(resolve => setTimeout(resolve, delay));

                            setAgentThoughts(prev => ({
                                ...prev,
                                [step.agentId]: [...(prev[step.agentId] || []), thoughts[j]]
                            }));
                        }
                    } else {
                        setCurrentReport(step.report);
                    }

                    // Wait for thinking/deliberation
                    if (!step.isThinking) {
                        const isCatchingUp = i < realFlow.length - 1;
                        await new Promise(resolve => setTimeout(resolve, isCatchingUp ? 500 : step.duration * 0.7));
                    }

                    // Add to conversation history
                    setConversationHistory(prev => {
                        // Avoid duplicates
                        if (prev.find(h => h.message === step.message && h.timestamp === step.timestamp)) return prev;
                        return [...prev, { ...step, timestamp: Date.now() }];
                    });

                    // Clear active thinker but keep thoughts visible
                    if (step.isThinking) {
                        setActiveThinker(null);
                    }

                    // Wait before next step
                    if (!step.isFinal) {
                        await new Promise(resolve => setTimeout(resolve, 600));
                    }
                }
            }

            // Check for completion
            const lastStep = realFlow[realFlow.length - 1];
            if (lastStep && lastStep.isFinal) {
                // Analysis complete
                setTimeout(() => {
                    setAnalyzing(false);
                    setShowVerdictButton(true);
                    setActiveAgent(null);
                    setCurrentReport("Analysis complete. final verdict is ready.");
                }, 1000);
            }

            processingRef.current = false;
        };

        runConversation();
    }, [analyzing, isLoadingData, realFlow]);

    const getAgentById = (id: string) => AGENTS.find(agent => agent.id === id);

    const getAgentThoughts = (agentId: string) => {
        return agentThoughts[agentId] || [];
    };

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 border-b border-charcoal/5 dark:border-white/5 flex justify-between items-center bg-parchment/50 dark:bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-teal" />
                    <span className="font-serif text-lg font-bold tracking-tight text-teal dark:text-parchment">JurAI Courtroom</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-teal/5 rounded-full border border-teal/10">
                        <Activity className="w-3 h-3 text-teal animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-teal">
                            {analyzing ? "Court in Session" : "Verdict Ready"}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6">
                {/* Courtroom Layout - Horizontal Layout */}
                <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 lg:gap-16 mb-8">
                    {/* Left Agent - Juror */}
                    <div className="w-full lg:w-1/3 flex flex-col items-center">
                        <div className="relative mb-4">
                            <motion.div
                                animate={activeThinker === "REG-001" || activeAgent === "REG-001" ? {
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 1, -1, 0],
                                    boxShadow: [
                                        "0 0 0px rgba(59, 130, 246, 0)",
                                        "0 0 30px rgba(59, 130, 246, 0.6)",
                                        "0 0 0px rgba(59, 130, 246, 0)"
                                    ]
                                } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={cn(
                                    "w-20 h-20 md:w-24 md:h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative",
                                    getAgentById("REG-001")?.borderColor,
                                    getAgentById("REG-001")?.bgColor,
                                    conversationHistory.some(msg => msg.agentId === "REG-001") && "ring-2 ring-blue-500/20"
                                )}
                            >
                                <Shield className={cn(
                                    "w-10 h-10 md:w-12 md:h-12 transition-colors duration-500",
                                    getAgentById("REG-001")?.color
                                )} />
                                {(activeThinker === "REG-001" || activeAgent === "REG-001") && (
                                    <div className="absolute -top-2 -right-2">
                                        <Brain className="w-5 h-5 text-blue-500 animate-pulse" />
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        <div className="text-center mb-4">
                            <p className={cn(
                                "font-serif text-lg font-bold",
                                getAgentById("REG-001")?.color
                            )}>{getAgentById("REG-001")?.title}</p>
                            <p className="text-xs font-mono uppercase tracking-tight text-slate/40">
                                {getAgentById("REG-001")?.name}
                            </p>
                        </div>

                        {/* Thinking Box for Juror */}
                        <div className="w-full max-w-md">
                            <div className={cn(
                                "bg-white dark:bg-[#151515] border border-blue-500/20 rounded-lg shadow-lg h-64 transition-all duration-300",
                                getAgentThoughts("REG-001").length > 0 ? "opacity-100" : "opacity-50"
                            )}>
                                <div className="p-4 h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                                        <Brain className="w-5 h-5 text-blue-500 animate-pulse" />
                                        <span className="text-sm font-mono font-bold text-blue-500">Juror's Thoughts</span>
                                    </div>
                                    <div
                                        ref={thoughtRefs["REG-001"]}
                                        className="flex-1 overflow-y-auto space-y-2 pr-2"
                                    >
                                        {getAgentThoughts("REG-001").length > 0 ? (
                                            getAgentThoughts("REG-001").map((thought, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="text-sm text-slate-600 dark:text-slate-300 p-2 bg-blue-500/5 rounded border border-blue-500/10"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                                        <span>{thought}</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-400 dark:text-slate-500 py-8">
                                                <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">Waiting for Juror to begin analysis...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center Agent - Judge */}
                    <div className="w-full lg:w-1/3 flex flex-col items-center">
                        <div className="relative mb-4">
                            <motion.div
                                animate={activeThinker === "JDG-100" || activeAgent === "JDG-100" ? {
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 1, -1, 0],
                                    boxShadow: [
                                        "0 0 0px rgba(13, 92, 99, 0)",
                                        "0 0 30px rgba(13, 92, 99, 0.6)",
                                        "0 0 0px rgba(13, 92, 99, 0)"
                                    ]
                                } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={cn(
                                    "w-24 h-24 md:w-28 md:h-28 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative",
                                    getAgentById("JDG-100")?.borderColor,
                                    getAgentById("JDG-100")?.bgColor,
                                    conversationHistory.some(msg => msg.agentId === "JDG-100") && "ring-2 ring-teal/20"
                                )}
                            >
                                <Gavel className={cn(
                                    "w-12 h-12 md:w-14 md:h-14 transition-colors duration-500",
                                    getAgentById("JDG-100")?.color
                                )} />
                                {(activeThinker === "JDG-100" || activeAgent === "JDG-100") && (
                                    <div className="absolute -top-2 -right-2">
                                        <Brain className="w-5 h-5 text-teal animate-pulse" />
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        <div className="text-center mb-4">
                            <p className={cn(
                                "font-serif text-lg font-bold",
                                getAgentById("JDG-100")?.color
                            )}>{getAgentById("JDG-100")?.title}</p>
                            <p className="text-xs font-mono uppercase tracking-tight text-slate/40">
                                {getAgentById("JDG-100")?.name}
                            </p>
                        </div>

                        {/* Thinking Box for Judge */}
                        <div className="w-full max-w-md">
                            <div className={cn(
                                "bg-white dark:bg-[#151515] border border-teal/20 rounded-lg shadow-lg h-64 transition-all duration-300",
                                getAgentThoughts("JDG-100").length > 0 ? "opacity-100" : "opacity-50"
                            )}>
                                <div className="p-4 h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                                        <Brain className="w-5 h-5 text-teal animate-pulse" />
                                        <span className="text-sm font-mono font-bold text-teal">Judge's Deliberation</span>
                                    </div>
                                    <div
                                        ref={thoughtRefs["JDG-100"]}
                                        className="flex-1 overflow-y-auto space-y-2 pr-2"
                                    >
                                        {getAgentThoughts("JDG-100").length > 0 ? (
                                            getAgentThoughts("JDG-100").map((thought, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="text-sm text-slate-600 dark:text-slate-300 p-2 bg-teal/5 rounded border border-teal/10"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-teal mt-1.5 flex-shrink-0"></div>
                                                        <span>{thought}</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-400 dark:text-slate-500 py-8">
                                                <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">Waiting for Judge's deliberation...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Agent - Critic */}
                    <div className="w-full lg:w-1/3 flex flex-col items-center">
                        <div className="relative mb-4">
                            <motion.div
                                animate={activeThinker === "CRT-009" || activeAgent === "CRT-009" ? {
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 1, -1, 0],
                                    boxShadow: [
                                        "0 0 0px rgba(168, 85, 247, 0)",
                                        "0 0 30px rgba(168, 85, 247, 0.6)",
                                        "0 0 0px rgba(168, 85, 247, 0)"
                                    ]
                                } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={cn(
                                    "w-20 h-20 md:w-24 md:h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative",
                                    getAgentById("CRT-009")?.borderColor,
                                    getAgentById("CRT-009")?.bgColor,
                                    conversationHistory.some(msg => msg.agentId === "CRT-009") && "ring-2 ring-purple-500/20"
                                )}
                            >
                                <Scale className={cn(
                                    "w-10 h-10 md:w-12 md:h-12 transition-colors duration-500",
                                    getAgentById("CRT-009")?.color
                                )} />
                                {(activeThinker === "CRT-009" || activeAgent === "CRT-009") && (
                                    <div className="absolute -top-2 -right-2">
                                        <Brain className="w-5 h-5 text-purple-500 animate-pulse" />
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        <div className="text-center mb-4">
                            <p className={cn(
                                "font-serif text-lg font-bold",
                                getAgentById("CRT-009")?.color
                            )}>{getAgentById("CRT-009")?.title}</p>
                            <p className="text-xs font-mono uppercase tracking-tight text-slate/40">
                                {getAgentById("CRT-009")?.name}
                            </p>
                        </div>

                        {/* Thinking Box for Critic */}
                        <div className="w-full max-w-md">
                            <div className={cn(
                                "bg-white dark:bg-[#151515] border border-purple-500/20 rounded-lg shadow-lg h-64 transition-all duration-300",
                                getAgentThoughts("CRT-009").length > 0 ? "opacity-100" : "opacity-50"
                            )}>
                                <div className="p-4 h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                                        <Brain className="w-5 h-5 text-purple-500 animate-pulse" />
                                        <span className="text-sm font-mono font-bold text-purple-500">Critic's Analysis</span>
                                    </div>
                                    <div
                                        ref={thoughtRefs["CRT-009"]}
                                        className="flex-1 overflow-y-auto space-y-2 pr-2"
                                    >
                                        {getAgentThoughts("CRT-009").length > 0 ? (
                                            getAgentThoughts("CRT-009").map((thought, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="text-sm text-slate-600 dark:text-slate-300 p-2 bg-purple-500/5 rounded border border-purple-500/10"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                                                        <span>{thought}</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-400 dark:text-slate-500 py-8">
                                                <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">Waiting for Critic to begin analysis...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Report Display */}
                <div className="max-w-6xl mx-auto mb-8">
                    <AnimatePresence>
                        {currentReport && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-lg p-6 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <ScrollText className="w-5 h-5 text-teal" />
                                    <h3 className="font-serif text-lg text-teal">Current Analysis Report</h3>
                                    <div className="ml-auto flex items-center gap-2">
                                        {activeAgent && (
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-full text-sm font-mono uppercase tracking-wider",
                                                getAgentById(activeAgent)?.bgColor,
                                                getAgentById(activeAgent)?.color
                                            )}>
                                                {getAgentById(activeAgent)?.title}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {currentReport}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Status Area - Only show verdict button when complete */}
                <div className="max-w-6xl mx-auto text-center">
                    <AnimatePresence mode="wait">
                        {analyzing ? (
                            <motion.div
                                key="analyzing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-3 mb-8"
                            >
                                <div className="flex items-center gap-2 text-teal font-serif text-lg">
                                    <Activity className="w-5 h-5 animate-pulse" />
                                    <span>Court is in session. Agents are deliberating...</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Watch each agent's thought box above to follow their analysis process
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-teal/5 via-purple-500/5 to-blue-500/5 border border-teal/20 rounded-xl p-8 mb-8"
                            >
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <CheckCircle2 className="w-8 h-8 text-teal" />
                                    <h3 className="font-serif text-2xl text-teal">Deliberation Complete</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
                                    All judicial agents have completed their analysis. The Judge has reviewed all evidence points and is ready to deliver the final verdict.
                                </p>

                                {/* View Verdict Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="text-center"
                                >
                                    <Link
                                        href="/verdict"
                                        className="inline-flex items-center justify-center px-12 py-5 bg-teal text-parchment font-serif text-xl rounded-lg shadow-xl hover:shadow-teal/40 transition-all duration-500 group overflow-hidden hover:scale-105"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            <Hammer className="w-6 h-6 mr-3" />
                                            View Final Verdict
                                            <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                        </span>
                                    </Link>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-mono uppercase tracking-wider">
                                        Comprehensive legal assessment with actionable recommendations
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Background Decoration */}
            <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.02] dark:opacity-[0.03]">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>
        </div>
    );
}
