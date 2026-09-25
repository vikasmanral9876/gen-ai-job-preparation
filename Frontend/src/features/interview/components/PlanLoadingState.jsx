import React, { useState, useEffect } from "react";
import {
  Logo,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Target,
  FileText,
  Award,
} from "../../../components/ui/Icons";
import "../style/loading-state.scss";

const AI_STEPS = [
  {
    label: "Role Analysis",
    description: "Analyzing job description requirements, level & seniority context...",
    icon: Target,
  },
  {
    label: "Competency Mapping",
    description: "Cross-referencing resume qualifications with role expectations...",
    icon: FileText,
  },
  {
    label: "Question Synthesis",
    description: "Structuring tailored technical, behavioral & STAR interview questions...",
    icon: Sparkles,
  },
  {
    label: "Readiness Strategy",
    description: "Calculating ATS keyword match & calibrating preparation milestones...",
    icon: Award,
  },
];

const PlanLoadingState = ({
  title = "Generating Your Custom Interview Plan",
  subtitle,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < AI_STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const activeStep = AI_STEPS[currentStepIndex];

  return (
    <main className="plan-loading-screen" role="status" aria-live="polite">
      {/* Background ambient lighting glows */}
      <div className="plan-loading-screen__glow-top" />
      <div className="plan-loading-screen__glow-bottom" />

      <div className="plan-loading-card">
        {/* Animated Central Hero Orb */}
        <div className="plan-loading-orb-container">
          <div className="plan-loading-orb__ring-outer" />
          <div className="plan-loading-orb__ring-inner" />
          <div className="plan-loading-orb__core">
            <Logo size={38} />
          </div>
          <div className="plan-loading-orb__badge">
            <Sparkles size={14} />
          </div>
        </div>

        {/* AI Engine Status Pill */}
        <div className="plan-loading-engine-pill">
          <span className="live-dot" />
          <span className="engine-text">Gemini 3.0 Reasoning Engine Active</span>
        </div>

        {/* Header Titles */}
        <div className="plan-loading-header">
          <h2 className="plan-loading-title">{title}</h2>
          <p className="plan-loading-subtitle">
            {subtitle || activeStep.description}
          </p>
        </div>

        {/* Animated Multi-color Shimmer Progress Bar */}
        <div className="plan-loading-bar-wrap">
          <div
            className="plan-loading-bar-progress"
            style={{
              width: `${Math.min(100, (currentStepIndex + 1) * 25)}%`,
            }}
          />
          <div className="plan-loading-bar-shimmer" />
        </div>

        {/* Real-time Step Milestones */}
        <div className="plan-loading-steps">
          {AI_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={step.label}
                className={`loading-step-item ${
                  isCompleted ? "loading-step-item--completed" : ""
                } ${isCurrent ? "loading-step-item--current" : ""}`}
              >
                <div className="step-icon-bubble">
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="spin-icon" />
                  ) : (
                    <StepIcon size={14} />
                  )}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Helpful reassurance footer */}
        <div className="plan-loading-footer">
          <ShieldCheck size={14} />
          <span>
            Synthesizing 360° interview preparation blueprint & ATS recommendations
          </span>
        </div>
      </div>
    </main>
  );
};

export default PlanLoadingState;
