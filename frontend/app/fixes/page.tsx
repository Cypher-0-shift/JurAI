import { Suspense } from "react";
import FixesClient from "./FixesClient";
import { Loader2, Wrench } from "lucide-react";

function FixesLoading() {
    return (
        <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] flex flex-col items-center justify-center space-y-6">
            <div className="relative">
                <Loader2 className="w-16 h-16 text-teal animate-spin" />
                <Wrench className="w-6 h-6 text-teal absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="font-serif text-2xl text-teal">
                    Loading Fixes...
                </h2>
                <p className="text-slate/60 font-mono text-sm max-w-md">
                    JurAI agents are generating engineering steps for your compliance gaps.
                </p>
            </div>
        </div>
    );
}

export default function FixesPage() {
    return (
        <Suspense fallback={<FixesLoading />}>
            <FixesClient />
        </Suspense>
    );
}