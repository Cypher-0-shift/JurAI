"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, Scale, Wrench } from "lucide-react";

interface TabNavigationProps {
    activeTab: "analysis" | "verdict" | "fixes";
}

export function TabNavigation({ activeTab }: TabNavigationProps) {
    const searchParams = useSearchParams();
    const runId = searchParams.get("run_id");
    const featureId = searchParams.get("feature_id");

    const tabs = [
        {
            id: "analysis",
            label: "Live Analysis",
            href: `/analysis?run_id=${runId || ""}&feature_id=${featureId || ""}`,
            icon: Activity,
            disabled: false
        },
        {
            id: "verdict",
            label: "Verdict",
            href: `/verdict?run_id=${runId || ""}&feature_id=${featureId || ""}`,
            icon: Scale,
            disabled: !runId // Disable if no run_id
        },
        {
            id: "fixes",
            label: "Remediation",
            href: `/fixes?run_id=${runId || ""}&feature_id=${featureId || ""}`,
            icon: Wrench,
            disabled: !runId
        }
    ];

    return (
        <div className="flex items-center justify-center mb-8">
            <div className="bg-white dark:bg-[#151515] p-1 rounded-full border border-charcoal/10 dark:border-white/10 shadow-sm inline-flex">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <Link
                            key={tab.id}
                            href={tab.disabled ? "#" : tab.href}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                                isActive
                                    ? "bg-teal text-parchment shadow-md"
                                    : "text-slate/60 hover:text-teal hover:bg-teal/5",
                                tab.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
