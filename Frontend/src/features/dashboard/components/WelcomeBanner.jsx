import React from "react";
import { Link } from "react-router";
import { Sparkles, ArrowRight, ShieldCheck } from "../../../components/ui/Icons";

const WelcomeBanner = ({ user, plansCount }) => {
  const displayName = user?.username ? user.username.split(" ")[0] : "Candidate";

  return (
    <section className="welcome-banner">
      <div className="welcome-banner__content">
        <div className="welcome-pill">
          <ShieldCheck size={14} />
          <span>Active Preparation Workspace</span>
        </div>
        <h1>
          Welcome back, <span className="highlight-name">{displayName}</span> 👋
        </h1>
        <p>
          Analyze your target roles, review tailored interview questions, and build ATS-optimized resumes backed by Gemini 3.0 intelligence.
        </p>
      </div>

      <div className="welcome-banner__actions">
        <Link to="/create" className="primary-cta-btn">
          <Sparkles size={18} />
          <span>Create Custom Interview Plan</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export default WelcomeBanner;
