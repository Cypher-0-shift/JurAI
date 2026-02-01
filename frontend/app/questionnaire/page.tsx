"use client";

import { useState, useRef, useEffect } from "react";
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

    const [sessionId, setSessionId] = useState("");

    useEffect(() => {
        setSessionId(new Date().getTime().toString(36).toUpperCase());
    }, []);

    const currentQuestion = QUESTIONS[currentStep];
    const isLastStep = currentStep === QUESTIONS.length;
    const progress = ((currentStep + 1) / (QUESTIONS.length + 1)) * 100;

    // Check if question should be shown based on conditional logic
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
        // Skip questions that don't meet conditional requirements
        while (nextStep < QUESTIONS.length && !shouldShowQuestion(QUESTIONS[nextStep], currentAnswers)) {
            nextStep++;
        }
        setCurrentStep(nextStep);
    };

    const goToPreviousQuestion = () => {
        let prevStep = currentStep - 1;
        // Skip questions that don't meet conditional requirements
        while (prevStep >= 0 && !shouldShowQuestion(QUESTIONS[prevStep])) {
            prevStep--;
        }
        if (prevStep >= 0) {
            setCurrentStep(prevStep);
        }
    };

    const handleNext = () => {
        let currentAnswers = answers;
        if (currentQuestion.type === "text" || currentQuestion.type === "textarea") {
            currentAnswers = { ...answers, [currentQuestion.id]: textInputs[currentQuestion.id] || "" };
            setAnswers(currentAnswers);
        }
        goToNextQuestion(currentAnswers);
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
            let isValid = false;
            if (q.type === "text" || q.type === "textarea") {
                isValid = (textInputs[q.id] || "").trim().length > 0;
            } else if (q.type === "multiselect") {
                isValid = ((answers[q.id] as string[]) || []).length > 0;
            } else {
                isValid = !!answers[q.id];
            }
            if (!isValid) {
                console.log("Validation failed for:", q.id, "Type:", q.type, "Value:", answers[q.id] || textInputs[q.id]);
            }
            return isValid;
        });

    const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

        // Reset states
        setUploadError(null);
        setUploadSuccess(false);

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            setUploadError('Please upload a valid JSON file (must end with .json)');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                console.log('File content loaded, length:', content.length);

                const jsonData = JSON.parse(content);
                console.log('JSON parsed successfully:', jsonData);

                // Validate JSON structure
                if (Array.isArray(jsonData)) {
                    setUploadError('Invalid JSON format. Your file contains an array [...]. Please use an object format like: {"feature": "My Feature", "jurisdictions": ["EU", "US"]}. Download the sample template for the correct format.');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                if (typeof jsonData !== 'object' || jsonData === null) {
                    setUploadError('Invalid JSON format. Expected an object with question IDs as keys. Download the sample template to see the correct format.');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                // Populate answers and textInputs
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
                                // Convert single value to array for multiselect
                                newAnswers[question.id] = [String(jsonData[question.id])];
                            }
                        } else {
                            newAnswers[question.id] = String(jsonData[question.id]);
                        }
                    }
                });

                console.log('Processed', processedCount, 'questions');

                if (processedCount === 0) {
                    setUploadError('No matching question fields found in JSON. Please check that your field names match the question IDs. Download the sample template to see the correct field names.');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                // ✅ Success - update state
                setAnswers(newAnswers);
                setTextInputs(newTextInputs);
                setUploadSuccess(true);
                setShowUploadSection(false);

                console.log('Upload successful! Loaded', processedCount, 'answers');

                // Auto-hide success message after 3 seconds
                setTimeout(() => setUploadSuccess(false), 3000);

                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (error) {
                console.error('JSON parse error:', error);
                setUploadError(`Failed to parse JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.onerror = (error) => {
            console.error('File read error:', error);
            setUploadError('Failed to read file. Please try again.');
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        reader.readAsText(file);
    };

    const downloadSampleJson = () => {
        const sampleData: Record<string, any> = {};
        QUESTIONS.forEach(q => {
            if (q.type === 'multiselect') {
                sampleData[q.id] = [];
            } else {
                sampleData[q.id] = '';
            }
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
            {/* Header */}
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

                                {/* JSON Upload Section */}
                                {currentStep === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6"
                                    >
                                        {/* Upload Success Notification */}
                                        <AnimatePresence>
                                            {uploadSuccess && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mb-4 p-4 bg-teal/10 border border-teal/30 rounded-sm flex items-center gap-3"
                                                >
                                                    <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                                                    <p className="text-sm text-teal font-medium">
                                                        Answers loaded successfully! You can now review and edit them.
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Upload Error Notification */}
                                        <AnimatePresence>
                                            {uploadError && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-sm flex items-start gap-3"
                                                >
                                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                            {uploadError}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setUploadError(null)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Upload Toggle Button */}
                                        <button
                                            onClick={() => setShowUploadSection(!showUploadSection)}
                                            className="w-full p-4 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm hover:border-teal/50 hover:bg-teal/5 transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileJson className="w-5 h-5 text-teal" />
                                                <div className="text-left">
                                                    <p className="font-medium text-sm">Upload JSON Answers</p>
                                                    <p className="text-xs text-slate/60 dark:text-slate/40">
                                                        Import pre-filled questionnaire responses
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight
                                                className={cn(
                                                    "w-5 h-5 text-slate/40 transition-transform duration-300",
                                                    showUploadSection && "rotate-90"
                                                )}
                                            />
                                        </button>

                                        {/* Upload Section Content */}
                                        <AnimatePresence>
                                            {showUploadSection && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-3 p-5 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm space-y-4">
                                                        {/* File Input */}
                                                        <div>
                                                            <label
                                                                htmlFor="json-upload"
                                                                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-charcoal/20 dark:border-white/20 rounded-sm hover:border-teal/50 hover:bg-teal/5 transition-all cursor-pointer group"
                                                            >
                                                                <Upload className="w-8 h-8 text-teal mb-3 group-hover:scale-110 transition-transform" />
                                                                <p className="text-sm font-medium text-charcoal dark:text-parchment mb-1">
                                                                    Click to upload JSON file
                                                                </p>
                                                                <p className="text-xs text-slate/60 dark:text-slate/40">
                                                                    or drag and drop your questionnaire JSON here
                                                                </p>
                                                            </label>
                                                            <input
                                                                ref={fileInputRef}
                                                                id="json-upload"
                                                                type="file"
                                                                accept=".json,application/json"
                                                                onChange={handleJsonUpload}
                                                                className="hidden"
                                                            />
                                                        </div>

                                                        {/* Divider */}
                                                        <div className="relative">
                                                            <div className="absolute inset-0 flex items-center">
                                                                <div className="w-full border-t border-charcoal/10 dark:border-white/10"></div>
                                                            </div>
                                                            <div className="relative flex justify-center text-xs uppercase">
                                                                <span className="bg-white dark:bg-[#151515] px-2 text-slate/50 flex items-center gap-2">
                                                                    <span>SESSION ID:</span>
                                                                    <span className="bg-charcoal/5 dark:bg-white/10 px-2 py-0.5 rounded min-w-[3rem] text-center inline-block">
                                                                        {sessionId || "..."}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Download Sample Button */}
                                                        <button
                                                            onClick={downloadSampleJson}
                                                            className="w-full p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-sm hover:bg-charcoal/10 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                                        >
                                                            <FileJson className="w-4 h-4" />
                                                            Download Sample JSON Template
                                                        </button>

                                                        {/* Info Text */}
                                                        <div className="flex items-start gap-2 p-3 bg-teal/5 border border-teal/20 rounded-sm">
                                                            <Info className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                                            <p className="text-xs text-slate/70 dark:text-slate/50">
                                                                Upload a JSON file with your questionnaire answers. The file should contain question IDs as keys and your answers as values. Download the template to see the expected format.
                                                            </p>
                                                        </div>
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
                                                <button
                                                    key={option}
                                                    onClick={() => handleOptionSelect(option)}
                                                    className={cn(
                                                        "group flex items-center justify-between p-5 rounded-sm border transition-all duration-300 text-left",
                                                        isSelected
                                                            ? "bg-teal border-teal text-parchment"
                                                            : "bg-white dark:bg-[#151515] border-charcoal/10 dark:border-white/10 hover:border-teal/50 hover:bg-teal/5"
                                                    )}
                                                >
                                                    <span className="font-medium">{option}</span>
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                                        isSelected
                                                            ? "bg-parchment border-parchment"
                                                            : "border-charcoal/20 dark:border-white/20 group-hover:border-teal"
                                                    )}>
                                                        {isSelected && (
                                                            <Check className="w-3 h-3 text-teal" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {currentQuestion.type === "multiselect" && (
                                            <button
                                                onClick={handleNext}
                                                disabled={!canProceed()}
                                                className={cn(
                                                    "mt-4 px-6 py-3 bg-teal text-parchment font-medium rounded-sm transition-all",
                                                    !canProceed() && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                Continue
                                            </button>
                                        )}
                                    </div>
                                ) : currentQuestion.type === "text" ? (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={textInputs[currentQuestion.id] || ""}
                                            onChange={(e) => handleTextInput(e.target.value)}
                                            placeholder={currentQuestion.placeholder}
                                            className="w-full p-4 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all font-sans text-lg"
                                        />
                                        <button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            className={cn(
                                                "px-6 py-3 bg-teal text-parchment font-medium rounded-sm transition-all",
                                                !canProceed() && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <textarea
                                            value={textInputs[currentQuestion.id] || ""}
                                            onChange={(e) => handleTextInput(e.target.value)}
                                            placeholder={currentQuestion.placeholder}
                                            className="w-full h-48 p-4 bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all resize-none font-sans text-lg leading-relaxed"
                                        />
                                        <button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            className={cn(
                                                "px-6 py-3 bg-teal text-parchment font-medium rounded-sm transition-all",
                                                !canProceed() && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                )}

                                {currentStep > 0 && (
                                    <button
                                        onClick={goToPreviousQuestion}
                                        className="text-slate/60 hover:text-teal transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous Question
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <span className="text-gold font-mono text-xs uppercase tracking-[0.2em]">
                                        Review & Submit
                                    </span>
                                    <h2 className="font-serif text-3xl md:text-4xl text-teal dark:text-parchment">
                                        Ready for Legal Analysis
                                    </h2>
                                    <p className="text-slate/100 dark:text-slate/100 text-lg">
                                        Review your answers and submit for comprehensive legal compliance analysis.
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-[#151515] border border-charcoal/10 dark:border-white/10 rounded-sm p-6 space-y-4 max-h-96 overflow-y-auto">
                                    {QUESTIONS.filter(q => shouldShowQuestion(q)).map((q) => (
                                        <div key={q.id} className="border-b border-charcoal/5 dark:border-white/5 pb-4 last:border-0">
                                            <h3 className="font-medium text-sm text-slate/60 dark:text-slate/40">{q.title}</h3>
                                            <p className="text-lg mt-1">
                                                {Array.isArray(answers[q.id])
                                                    ? (answers[q.id] as string[]).join(", ")
                                                    : answers[q.id] || textInputs[q.id] || "Not answered"}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <button
                                        onClick={goToPreviousQuestion}
                                        className="text-slate/60 hover:text-teal transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Back to Questions
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (isSubmitting) return;

                                            // Manual Validation Check for Alert
                                            const missing = QUESTIONS.filter(q => !q.optional && shouldShowQuestion(q)).filter(q => {
                                                if (q.type === "text" || q.type === "textarea") {
                                                    const val = textInputs[q.id] || (typeof answers[q.id] === 'string' ? (answers[q.id] as string) : "") || "";
                                                    return val.trim().length === 0;
                                                } else if (q.type === "multiselect") {
                                                    return ((answers[q.id] as string[]) || []).length === 0;
                                                } else {
                                                    return !answers[q.id];
                                                }
                                            });

                                            if (missing.length > 0) {
                                                alert(`Please answer the following required questions: ${missing.map(q => q.title).join(", ")}`);
                                                // Optional: Navigate to first missing?
                                                return;
                                            }

                                            setIsSubmitting(true);
                                            try {
                                                const payload = {
                                                    ...textInputs,
                                                    ...Object.fromEntries(
                                                        Object.entries(answers).map(([k, v]) => [k, Array.isArray(v) ? v : v])
                                                    )
                                                };

                                                const featureId = "feat_" + Date.now();
                                                const contextData = {
                                                    ...payload,
                                                    feature_id: featureId,
                                                    timestamp: new Date().toISOString()
                                                };

                                                // Save context for Analysis Page to pick up
                                                localStorage.setItem("pipeline_context", JSON.stringify(contextData));

                                                // Redirect to Analysis page
                                                router.push("/analysis");

                                            } catch (error) {
                                                console.error("Submission failed:", error);
                                                alert("Failed to submit assessment. Please try again.");
                                                setIsSubmitting(false);
                                            }
                                        }}
                                        disabled={isSubmitting} // Only disable if submitting, not if invalid (so we can show alert)
                                        className={cn(
                                            "relative inline-flex items-center justify-center px-10 py-4 bg-teal text-parchment font-serif text-lg rounded-sm shadow-xl transition-all duration-500 group overflow-hidden",
                                            isSubmitting && "opacity-50 cursor-not-allowed grayscale"
                                        )}
                                    >
                                        <span className="relative z-10 flex items-center">
                                            {isSubmitting ? "Submitting..." : "Submit for Legal Review"}
                                            {!isSubmitting && <Gavel className="ml-3 w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />}
                                        </span>
                                        <motion.div
                                            whileTap={{ scale: 1.5, opacity: 0.2 }}
                                            className="absolute inset-0 bg-charcoal opacity-0 group-hover:opacity-10 transition-opacity"
                                        />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/legal-bg.jpeg')] bg-cover bg-center opacity-[0.35] grayscale mix-blend-multiply dark:mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal/5 via-transparent to-transparent" />
            </div>
        </div>
    );
}