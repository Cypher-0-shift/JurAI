"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ChevronLeft, ChevronRight, Check, Gavel, Info, Upload, FileJson, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const QUESTIONS = [
    {
        id: "feature",
        title: "Feature Basics",
        question: "What is the name of this feature?",
        subtitle: "Example: Chat Translation, User Analytics Dashboard",
        type: "text",
        placeholder: "Enter feature name",
    },
    {
        id: "feature_description",
        title: "Feature Description",
        question: "Briefly describe what this feature does.",
        subtitle: "What does it do? Who uses it? What problem does it solve? (1-3 sentences, plain English)",
        type: "textarea",
        placeholder: "Describe the feature in detail...",
    },
    {
        id: "jurisdictions",
        title: "Geography & Scope",
        question: "Where will this feature be available?",
        options: ["EU", "US", "India", "UK", "Global", "Other"],
        type: "multiselect",
    },
    {
        id: "needs_geo_specific_logic",
        title: "Regional Behavior",
        question: "Does the feature behave differently in different regions?",
        options: ["Yes", "No", "Not sure"],
        type: "select",
    },
    {
        id: "collects_personal_data",
        title: "Data & Privacy",
        question: "Does this feature collect or process personal user data?",
        options: ["Yes", "No"],
        type: "select",
    },
    {
        id: "personal_data_types",
        title: "Data Types",
        question: "What type of data does it handle?",
        options: [
            "Text / messages",
            "Images / media",
            "Voice / audio",
            "Location",
            "Usage analytics",
            "Personal identifiers (email, phone)",
            "Sensitive data (health, children, biometrics)"
        ],
        type: "multiselect",
        conditional: { dependsOn: "collects_personal_data", value: "Yes" },
    },
    {
        id: "storage_duration",
        title: "Data Storage",
        question: "How long is this data stored?",
        options: [
            "Not stored",
            "Less than 30 days",
            "30-90 days",
            "6-12 months",
            "Indefinitely"
        ],
        type: "select",
    },
    {
        id: "user_consent",
        title: "Consent & User Control",
        question: "Do users explicitly consent before this feature is enabled?",
        options: ["Yes (opt-in)", "No", "Opt-out"],
        type: "select",
    },
    {
        id: "can_opt_out",
        title: "User Control",
        question: "Can users disable or opt out of this feature later?",
        options: ["Yes", "No"],
        type: "select",
    },
    {
        id: "uses_ai",
        title: "AI & Automation",
        question: "Does this feature use AI or automated decision-making?",
        options: ["Yes", "No"],
        type: "select",
    },
    {
        id: "ai_affects_users",
        title: "AI Impact",
        question: "Can the AI significantly affect users? (e.g. content removal, ranking, access restriction)",
        options: ["Yes", "No"],
        type: "select",
        conditional: { dependsOn: "uses_ai", value: "Yes" },
    },
    {
        id: "can_report_issues",
        title: "Safety & Reporting",
        question: "Can users report issues or appeal decisions made by this feature?",
        options: ["Yes", "No"],
        type: "select",
    },
    {
        id: "legal_concerns",
        title: "Extra Context (Optional)",
        question: "Any legal, privacy, or ethical concerns you already suspect?",
        type: "textarea",
        placeholder: "Describe any concerns or additional context...",
        optional: true,
    },
    {
        id: "additional_context",
        title: "Additional Information",
        question: "Anything else we should know about how this feature works?",
        type: "textarea",
        placeholder: "Provide any additional context...",
        optional: true,
    },
];

export default function QuestionnairePage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [textInputs, setTextInputs] = useState<Record<string, string>>({});
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showUploadSection, setShowUploadSection] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const currentQuestion = QUESTIONS[currentStep];
    const isLastStep = currentStep === QUESTIONS.length;
    const progress = ((currentStep + 1) / (QUESTIONS.length + 1)) * 100;

    const shouldShowQuestion = (question: typeof QUESTIONS[0], currentAnswers = answers) => {
        if (!question.conditional) return true;
        const dependentAnswer = currentAnswers[question.conditional.dependsOn];
        return dependentAnswer === question.conditional.value;
    };

    const handleOptionSelect = (option: string) => {
        const question = QUESTIONS[currentStep];
        if (question.type === "multiselect") {
            const current = (answers[question.id] as string[]) || [];
            const updated = current.includes(option)
                ? current.filter(o => o !== option)
                : [...current, option];
            setAnswers({ ...answers, [question.id]: updated });
        } else {
            const newAnswers = { ...answers, [question.id]: option };
            setAnswers(newAnswers);
            setTimeout(() => {
                goToNextQuestion(newAnswers);
            }, 300);
        }
    };

    const handleTextInput = (value: string) => {
        setTextInputs({ ...textInputs, [currentQuestion.id]: value });
    };

    const goToNextQuestion = (currentAnswers = answers) => {
        let nextStep = currentStep + 1;
        while (nextStep < QUESTIONS.length && !shouldShowQuestion(QUESTIONS[nextStep], currentAnswers)) {
            nextStep++;
        }
        setCurrentStep(nextStep);
    };

    const goToPreviousQuestion = () => {
        let prevStep = currentStep - 1;
        while (prevStep >= 0 && !shouldShowQuestion(QUESTIONS[prevStep])) {
            prevStep--;
        }
        if (prevStep >= 0) {
            setCurrentStep(prevStep);
        }
    };

    const handleNext = () => {
        let updatedAnswers = answers;
        if (currentQuestion.type === "text" || currentQuestion.type === "textarea") {
            updatedAnswers = { ...answers, [currentQuestion.id]: textInputs[currentQuestion.id] || "" };
            setAnswers(updatedAnswers);
        }
        goToNextQuestion(updatedAnswers);
    };

    const canProceed = () => {
        if (currentQuestion.optional) return true;
        if (currentQuestion.type === "text" || currentQuestion.type === "textarea") {
            return (textInputs[currentQuestion.id] || "").trim().length > 0;
        }
        if (currentQuestion.type === "multiselect") {
            return ((answers[currentQuestion.id] as string[]) || []).length > 0;
        }
        return !!answers[currentQuestion.id];
    };

    const requiredQuestionsAnswered = QUESTIONS.filter(q => !q.optional && shouldShowQuestion(q))
        .every(q => {
            if (q.type === "text" || q.type === "textarea") {
                return (textInputs[q.id] || "").trim().length > 0;
            }
            if (q.type === "multiselect") {
                return ((answers[q.id] as string[]) || []).length > 0;
            }
            return !!answers[q.id];
        });

    const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setUploadSuccess(false);

        if (!file.name.toLowerCase().endsWith('.json')) {
            setUploadError('Please upload a valid JSON file (must end with .json)');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const jsonData = JSON.parse(content);

                if (Array.isArray(jsonData) || typeof jsonData !== 'object' || jsonData === null) {
                    setUploadError('Invalid JSON format. Expected an object with question IDs as keys.');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                const newAnswers: Record<string, string | string[]> = { ...answers };
                const newTextInputs: Record<string, string> = { ...textInputs };
                let processedCount = 0;

                QUESTIONS.forEach(question => {
                    if (jsonData[question.id] !== undefined && jsonData[question.id] !== null) {
                        processedCount++;
                        if (question.type === 'text' || question.type === 'textarea') {
                            newTextInputs[question.id] = String(jsonData[question.id]);
                        } else if (question.type === 'multiselect') {
                            if (Array.isArray(jsonData[question.id])) {
                                newAnswers[question.id] = jsonData[question.id].map(String);
                            } else {
                                newAnswers[question.id] = [String(jsonData[question.id])];
                            }
                        } else {
                            newAnswers[question.id] = String(jsonData[question.id]);
                        }
                    }
                });

                if (processedCount === 0) {
                    setUploadError('No matching question fields found in JSON.');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                setAnswers(newAnswers);
                setTextInputs(newTextInputs);
                setUploadSuccess(true);
                setShowUploadSection(false);
                setTimeout(() => setUploadSuccess(false), 3000);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (error) {
                setUploadError(`Failed to parse JSON file`);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const downloadSampleJson = () => {
        const sampleData: Record<string, any> = {};
        QUESTIONS.forEach(q => {
            if (q.type === 'multiselect') sampleData[q.id] = [];
            else sampleData[q.id] = '';
        });
        const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questionnaire-template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] text-charcoal dark:text-parchment flex flex-col">
            <header className="px-6 py-6 border-b border-charcoal/5 dark:border-white/5 flex justify-between items-center bg-parchment/50 dark:bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-teal/5 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-teal" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-teal" />
                        <span className="font-serif text-lg font-bold tracking-tight text-teal dark:text-parchment">JurAI</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate/50">Legal Review Progress</span>
                    <div className="w-48 h-1 bg-charcoal/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-teal"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="max-w-2xl w-full">
                    <AnimatePresence mode="wait">
                        {!isLastStep ? (
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "circOut" }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <span className="text-gold font-mono text-xs uppercase tracking-[0.2em]">
                                        Step {currentStep + 1} of {QUESTIONS.length}
                                    </span>
                                    <h2 className="font-serif text-5xl md:text-6xl text-teal dark:text-parchment leading-tight">
                                        {currentQuestion.title}
                                    </h2>
                                    <p className="text-slate/60 dark:text-slate/40 text-3xl md:text-4xl font-medium leading-relaxed">
                                        {currentQuestion.question}
                                    </p>
                                    {currentQuestion.subtitle && (
                                        <p className="text-slate/50 dark:text-slate/50 text-sm italic">
                                            {currentQuestion.subtitle}
                                        </p>
                                    )}
                                </div>

                                {currentStep === 0 && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                                        <AnimatePresence>
                                            {uploadSuccess && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 p-4 bg-teal/10 border border-teal/30 rounded-sm flex items-center gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                                                    <p className="text-sm text-teal font-medium">Answers loaded successfully!</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <AnimatePresence>
                                            {uploadError && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-sm flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1"><p className="text-sm text-red-600 dark:text-red-400 font-medium">{uploadError}</p></div>
                                                    <button onClick={() => setUploadError(null)} className="text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <button onClick={() => setShowUploadSection(!showUploadSection)} className="w-full p-4 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm hover:border-teal/50 hover:bg-teal/5 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <FileJson className="w-5 h-5 text-teal" />
                                                <div className="text-left">
                                                    <p className="font-medium text-sm">Upload JSON Answers</p>
                                                    <p className="text-xs text-slate/60 dark:text-slate/40">Import responses</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={cn("w-5 h-5 text-slate/40 transition-transform duration-300", showUploadSection && "rotate-90")} />
                                        </button>
                                        <AnimatePresence>
                                            {showUploadSection && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                                    <div className="mt-3 p-5 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm space-y-4">
                                                        <div>
                                                            <label htmlFor="json-upload" className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-charcoal/20 dark:border-white/20 rounded-sm hover:border-teal/50 hover:bg-teal/5 transition-all cursor-pointer group">
                                                                <Upload className="w-8 h-8 text-teal mb-3 group-hover:scale-110 transition-transform" />
                                                                <p className="text-sm font-medium text-charcoal dark:text-parchment mb-1">Click to upload JSON file</p>
                                                            </label>
                                                            <input ref={fileInputRef} id="json-upload" type="file" accept=".json,application/json" onChange={handleJsonUpload} className="hidden" />
                                                        </div>
                                                        <button onClick={downloadSampleJson} className="w-full p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-sm hover:bg-charcoal/10 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"><FileJson className="w-4 h-4" /> Download Sample JSON Template</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {currentQuestion.type === "select" || currentQuestion.type === "multiselect" ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentQuestion.options?.map((option) => {
                                            const isSelected = currentQuestion.type === "multiselect"
                                                ? ((answers[currentQuestion.id] as string[]) || []).includes(option)
                                                : answers[currentQuestion.id] === option;
                                            return (
                                                <button key={option} onClick={() => handleOptionSelect(option)} className={cn("group flex items-center justify-between p-5 rounded-sm border transition-all duration-300 text-left", isSelected ? "bg-teal border-teal text-parchment" : "bg-white dark:bg-[#151515] border-charcoal/10 dark:border-white/10 hover:border-teal/50 hover:bg-teal/5")}>
                                                    <span className="font-medium">{option}</span>
                                                    <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", isSelected ? "bg-parchment border-parchment" : "border-charcoal/20 dark:border-white/20 group-hover:border-teal")}>
                                                        {isSelected && <Check className="w-3 h-3 text-teal" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {currentQuestion.type === "multiselect" && (
                                            <button onClick={handleNext} disabled={!canProceed()} className={cn("mt-4 px-6 py-3 bg-teal text-parchment font-medium rounded-sm transition-all", !canProceed() && "opacity-50 cursor-not-allowed")}>Continue</button>
                                        )}
                                    </div>
                                ) : currentQuestion.type === "text" ? (
                                    <div className="space-y-4">
                                        <input type="text" value={textInputs[currentQuestion.id] || ""} onChange={(e) => handleTextInput(e.target.value)} placeholder={currentQuestion.placeholder} className="w-full p-4 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all font-sans text-lg" />
                                        <button onClick={handleNext} disabled={!canProceed()} className={cn("px-6 py-3 bg-teal text-parchment font-medium rounded-sm transition-all", !canProceed() && "opacity-50 cursor-not-allowed")}>Continue</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <textarea value={textInputs[currentQuestion.id] || ""} onChange={(e) => handleTextInput(e.target.value)} placeholder={currentQuestion.placeholder} className="w-full h-48 p-4 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all resize-none font-sans text-lg leading-relaxed" />
                                        <button onClick={handleNext} disabled={!canProceed()} className={cn("px-6 py-3 bg-teal text-parchment font-medium rounded-sm transition-all", !canProceed() && "opacity-50 cursor-not-allowed")}>Continue</button>
                                    </div>
                                )}

                                {currentStep > 0 && (
                                    <button onClick={goToPreviousQuestion} className="text-slate/60 hover:text-teal transition-colors flex items-center gap-2 text-sm font-medium">
                                        <ChevronLeft className="w-4 h-4" /> Previous Question
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="space-y-2">
                                    <span className="text-gold font-mono text-xs uppercase tracking-[0.2em]">Review & Submit</span>
                                    <h2 className="font-serif text-3xl md:text-4xl text-teal dark:text-parchment">Ready for Legal Analysis</h2>
                                    <p className="text-slate/60 dark:text-slate/40 text-lg">Review your answers and submit for comprehensive legal compliance analysis.</p>
                                </div>

                                <div className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm p-6 space-y-4 max-h-96 overflow-y-auto">
                                    {QUESTIONS.filter(q => shouldShowQuestion(q)).map((q) => (
                                        <div key={q.id} className="border-b border-charcoal/5 dark:border-white/5 pb-4 last:border-0">
                                            <h3 className="font-medium text-sm text-slate/60 dark:text-slate/40">{q.title}</h3>
                                            <p className="text-lg mt-1">{Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).join(", ") : answers[q.id] || textInputs[q.id] || "Not answered"}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <button onClick={goToPreviousQuestion} className="text-slate/60 hover:text-teal transition-colors flex items-center gap-2 text-sm font-medium">
                                        <ChevronLeft className="w-4 h-4" /> Back to Questions
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!requiredQuestionsAnswered || isSubmitting) return;

                                            // --- UPDATE: ALLOW SUBMISSION WITHOUT LOGIN ---
                                            // We now check for token but proceed anyway if missing
                                            // (Assuming backend is updated to allow this)
                                            const token = localStorage.getItem("access_token");
                                            // REMOVED: The check that forced redirection to login

                                            setIsSubmitting(true);
                                            try {
                                                const payload = {
                                                    ...textInputs,
                                                    ...Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, Array.isArray(v) ? v : v]))
                                                };

                                                const contextData = { ...payload, timestamp: new Date().toISOString() };

                                                // Pass token if we have it, otherwise undefined
                                                const response = await api.pipeline.runCore({ context_data: contextData }, token || undefined);

                                                const runId = response.run_id || "mock-run-" + Date.now();
                                                const featureId = response.feature_id || "mock-feature-" + Date.now();

                                                router.push(`/analysis?feature_id=${featureId}&run_id=${runId}`);

                                            } catch (error: any) {
                                                console.error("Submission failed:", error);
                                                alert("Failed to submit assessment. Please try again.");
                                                setIsSubmitting(false);
                                            }
                                        }}
                                        disabled={!requiredQuestionsAnswered || isSubmitting}
                                        className={cn("relative inline-flex items-center justify-center px-10 py-4 bg-teal text-parchment font-serif text-lg rounded-sm shadow-xl transition-all duration-500 group overflow-hidden", (!requiredQuestionsAnswered || isSubmitting) && "opacity-50 cursor-not-allowed grayscale")}
                                    >
                                        <span className="relative z-10 flex items-center">
                                            {isSubmitting ? "Submitting..." : "Submit for Legal Review"}
                                            {!isSubmitting && <Gavel className="ml-3 w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />}
                                        </span>
                                        <motion.div whileTap={{ scale: 1.5, opacity: 0.2 }} className="absolute inset-0 bg-charcoal opacity-0 group-hover:opacity-10 transition-opacity" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/legal-bg.jpeg')] bg-cover bg-center opacity-20 grayscale mix-blend-multiply dark:mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal/5 via-transparent to-transparent" />
            </div>
        </div>
    );
}