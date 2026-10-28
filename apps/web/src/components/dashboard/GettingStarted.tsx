import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";

interface OnboardingStep {
  key: string;
  label: string;
  completed: boolean;
  href?: string;
}

interface GettingStartedProps {
  steps: OnboardingStep[];
  onDismiss: () => void;
}

export function GettingStarted({ steps, onDismiss }: GettingStartedProps) {
  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Getting Started</h2>
          <p className="text-sm text-slate-600">
            {completedCount} of {steps.length} steps completed
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-slate-500 hover:text-slate-700 transition underline"
        >
          Dismiss
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.key} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-slate-300 flex-shrink-0" />
            )}
            <span className={`text-sm flex-1 ${step.completed ? "text-slate-600 line-through" : "text-slate-900 font-medium"}`}>
              {step.label}
            </span>
            {!step.completed && step.href && (
              <Link href={step.href} className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition">
                Start →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
