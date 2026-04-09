"use client";

import { useEffect, useState } from "react";
import { Search, Upload, MapPin } from "lucide-react";

interface OnboardingHintProps {
  nodeCount: number;
  hasHomeNode: boolean;
  homeJustSet: boolean;
}

const STEPS = [
  {
    icon: Search,
    title: "Search for a city",
    description: "Use the search bar to find a city you've visited.",
  },
  {
    icon: Upload,
    title: "Upload your memories",
    description: "Add at least 2 photos to connect an arc to your home city.",
  },
  {
    icon: MapPin,
    title: "Build your map",
    description: "Keep adding cities to trace your journey across the globe.",
  },
];

export default function OnboardingHint({
  nodeCount,
  hasHomeNode,
  homeJustSet,
}: OnboardingHintProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("trace-onboarding-dismissed")) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;
    if (homeJustSet && nodeCount <= 1) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [homeJustSet, nodeCount, dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("trace-onboarding-dismissed", "1");
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  };

  if (!visible || dismissed || !hasHomeNode) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div
        className="rounded-2xl px-5 py-4 flex items-start gap-4 max-w-sm"
        style={{
          background: "rgba(8,8,20,0.95)",
          border: "1px solid rgba(255,215,0,0.2)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(255,215,0,0.1)" }}
        >
          <Icon className="w-4 h-4" style={{ color: "rgba(255,215,0,0.8)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-medium mb-0.5"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {current.title}
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {current.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-colors"
                  style={{
                    background:
                      i === step
                        ? "rgba(255,215,0,0.8)"
                        : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDismiss}
                className="text-[11px] px-2.5 py-1 rounded-md transition-colors hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="text-[11px] font-medium px-3 py-1 rounded-md transition-colors"
                style={{
                  background: "rgba(255,215,0,0.12)",
                  color: "rgba(255,215,0,0.9)",
                  border: "1px solid rgba(255,215,0,0.2)",
                }}
              >
                {step < STEPS.length - 1 ? "Next" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
