
import { Suspense } from "react";
import VerdictClient from "./VerdictClient";

export default function VerdictPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-parchment dark:bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-teal font-serif text-xl animate-pulse">Loading JurAI Analysis...</div>
            </div>
        }>
            <VerdictClient />
        </Suspense>
    );
}
