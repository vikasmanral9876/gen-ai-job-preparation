/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import "../../../style.scss";

/**
 * ============================================================================
 * 4-LAYER REACT ARCHITECTURE: [UI LAYER]
 * ============================================================================
 * Pure presentation UI layer for the Custom Interview Report Generator.
 * Contains only the section from "Generate Custom Interview Report" to
 * "Generate Interview Report".
 * ============================================================================
 */

/* --- INLINE CRISP SVG ICONS --- */
const DocumentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16l-4-4-4 4" />
    <path d="M12 12v9" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const FilePdfIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15h2a1.5 1.5 0 0 0 0-3H9v6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.2 8.5L21 9.8L16 14.3L17.5 21L12 17.5L6.5 21L8 14.3L3 9.8L9.8 8.5L12 2Z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <polyline points="23 20 23 14 17 14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
  </svg>
);

/* --- PRESET TEMPLATES --- */
const PRESETS = {
  "Senior Full-Stack": `Senior Full-Stack Software Engineer
Key Responsibilities:
- Design, architect, and scale modern distributed cloud applications using React, Node.js, and TypeScript.
- Lead technical design reviews and establish high-throughput database patterns with PostgreSQL and Redis.
- Drive automated CI/CD deployment pipelines, system observability, and microservice resiliency.
- Mentor mid-level engineers and collaborate across product and design teams to deliver high-impact user experiences.`,

  "Staff AI Engineer": `Staff AI & LLM Systems Engineer
Key Responsibilities:
- Architect enterprise-grade generative AI pipelines, Retrieval-Augmented Generation (RAG) frameworks, and vector search systems.
- Optimize low-latency LLM inference architectures, token caching, and fine-tuning pipelines using PyTorch and vLLM.
- Implement comprehensive evaluation, guardrailing, and hallucination reduction benchmarks.
- Establish AI engineering best practices and collaborate with cross-functional leadership on GenAI platform strategy.`,

  "Product Lead": `Lead Technical Product Manager
Key Responsibilities:
- Lead product discovery, strategic roadmapping, and technical execution for core enterprise SaaS platforms.
- Partner with engineering leads to define technical requirements, API integrations, and developer ergonomics.
- Formulate data-driven product hypotheses, track key conversion funnels, and prioritize quarterly sprint backlogs.
- Present strategic product narratives to executive leadership and key enterprise stakeholders.`
};

/**
 * Main Home Component (UI Layer)
 */
const Home = () => {
  // Local UI Presentation States
  const [jdMode, setJdMode] = useState("paste");
  const [jdText, setJdText] = useState("");
  const [attachedResume, setAttachedResume] = useState({
    name: "Alex_Chen_Principal_Engineer_2025.pdf",
    size: "1.8 MB",
    status: "Ready to analyze",
    isSynced: true
  });
  const [selfDescription, setSelfDescription] = useState("");
  const [isDictating, setIsDictating] = useState(false);
  const [rigorOptions, setRigorOptions] = useState({
    systemDesign: true,
    behavioralStar: true,
    codingAlgorithmic: false
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef(null);

  // Computed Word & Character Count
  const wordsCount = jdText.trim() ? jdText.trim().split(/\s+/).length : 0;
  const charsCount = jdText.length;
  const isMinWordsMet = wordsCount >= 80;

  // UI Event Handlers
  const handleSelectPreset = (presetName) => {
    if (PRESETS[presetName]) {
      setJdText(PRESETS[presetName]);
    }
  };

  const handleLoadTemplate = () => {
    setJdText(PRESETS["Senior Full-Stack"]);
    setSelfDescription(
      "Principal full-stack engineer with 8 years of experience building high-throughput event-driven microservices. Looking to highlight technical leadership, distributed consensus architectures, and recent cross-team mentorship successes."
    );
  };

  const handleResetAll = () => {
    setJdText("");
    setSelfDescription("");
    setAttachedResume(null);
    setRigorOptions({
      systemDesign: true,
      behavioralStar: true,
      codingAlgorithmic: false
    });
  };

  const handleCopyJd = async () => {
    if (jdText) {
      try {
        await navigator.clipboard.writeText(jdText);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const handleClearJd = () => {
    setJdText("");
  };

  const handleAddTag = (tagText) => {
    setSelfDescription((prev) =>
      prev ? `${prev} Focusing on: ${tagText}.` : `Focusing on: ${tagText}.`
    );
  };

  const handleToggleDictate = () => {
    setIsDictating((prev) => !prev);
  };

  const handleToggleRigor = (key) => {
    setRigorOptions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleBrowseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setAttachedResume({
        name: file.name,
        size: sizeFormatted,
        status: "Ready to analyze",
        isSynced: true
      });
    }
  };

  const handleRemoveResume = () => {
    setAttachedResume(null);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("Interview report generation simulated! (Will be wired to API & Hook layers).");
    }, 1500);
  };

  return (
    <div className="interview-report-page">
      <main className="main-content-area">
        {/* -------------------------------------------------------------
            1. HERO SECTION: "Generate Custom Interview Report"
            ------------------------------------------------------------- */}
        <section className="interview-hero-section">
          <div className="hero-content">
            <h1 className="hero-main-title">Generate Custom Interview Report</h1>
            <p className="hero-subtitle">
              Synthesize real-world technical and behavioral interview scenarios, score matching
              probability, and get targeted answers aligned with your target role.
            </p>
          </div>

          <div className="hero-quick-actions">
            <button
              type="button"
              className="hero-action-btn load-template-btn"
              onClick={handleLoadTemplate}
            >
              <PlusIcon />
              <span>Load Template</span>
            </button>
            <button
              type="button"
              className="hero-action-btn reset-all-btn"
              onClick={handleResetAll}
            >
              <RefreshIcon />
              <span>Reset All</span>
            </button>
          </div>
        </section>

        {/* -------------------------------------------------------------
            2. TWO-COLUMN WORKSPACE GRID
            ------------------------------------------------------------- */}
        <div className="workspace-grid">
          {/* LEFT COLUMN: Job Description Card */}
          <div className="custom-card job-description-card">
            {/* Header */}
            <div className="card-header">
              <div className="card-header-left">
                <span className="card-status-dot dot-red" />
                <h2 className="card-title">Job Description</h2>
              </div>
              <span className="badge-required">Required</span>
            </div>

            {/* Input Mode Selector Tabs */}
            <div className="tab-segmented-control" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={jdMode === "paste"}
                className={`tab-segment-btn ${jdMode === "paste" ? "active" : ""}`}
                onClick={() => setJdMode("paste")}
              >
                <DocumentIcon />
                <span>Paste JD Text</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={jdMode === "url"}
                className={`tab-segment-btn ${jdMode === "url" ? "active" : ""}`}
                onClick={() => setJdMode("url")}
              >
                <LinkIcon />
                <span>Import URL</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={jdMode === "pdf"}
                className={`tab-segment-btn ${jdMode === "pdf" ? "active" : ""}`}
                onClick={() => setJdMode("pdf")}
              >
                <UploadCloudIcon />
                <span>PDF Upload</span>
              </button>
            </div>

            {/* Popular Presets */}
            <div className="presets-row">
              <span className="presets-label">Popular Presets:</span>
              <div className="presets-chips">
                {Object.keys(PRESETS).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="preset-chip-btn"
                    onClick={() => handleSelectPreset(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Inset Target Role Specs Box */}
            <div className="target-role-specs-box">
              <div className="specs-box-header">
                <span className="specs-box-label">TARGET ROLE SPECS</span>
                <div className="specs-actions">
                  <button
                    type="button"
                    className="specs-action-icon-btn"
                    title="Copy to clipboard"
                    onClick={handleCopyJd}
                  >
                    <CopyIcon />
                  </button>
                  <button
                    type="button"
                    className="specs-action-icon-btn"
                    title="Clear text"
                    onClick={handleClearJd}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <textarea
                id="jobDescription"
                name="jobDescription"
                className="specs-textarea"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste job description here (e.g. key responsibilities, qualifications, tech stack, level, and company domain expectations)..."
                rows={13}
              />

              <div className="specs-box-footer">
                <div className="footer-recommendation">
                  <span className={`status-indicator-dot ${isMinWordsMet ? "dot-green" : "dot-amber"}`} />
                  <span className="recommendation-text">Minimum 80 words recommended</span>
                </div>
                <div className="footer-counts">
                  <span>{wordsCount} words</span>
                  <span className="count-separator">•</span>
                  <span>{charsCount} chars</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Stacked Cards */}
          <div className="right-column-stack">
            {/* Top Card: Resume & Experience */}
            <div className="custom-card resume-experience-card">
              <div className="card-header">
                <div className="card-header-left">
                  <span className="card-status-dot dot-red" />
                  <h2 className="card-title">Resume & Experience</h2>
                </div>
                <span className="badge-ats">ATS Parser Active</span>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="file-dropzone-container">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="resumeUpload"
                  name="resumeUpload"
                  className="visually-hidden-input"
                  accept=".pdf,.docx,.rtf"
                  onChange={handleFileSelected}
                />

                <div className="dropzone-body" onClick={handleBrowseFileClick}>
                  <div className="dropzone-icon-circle">
                    <UploadCloudIcon />
                  </div>
                  <p className="dropzone-primary-text">
                    Drag and drop your resume here, or{" "}
                    <button
                      type="button"
                      className="browse-files-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBrowseFileClick();
                      }}
                    >
                      browse files
                    </button>
                  </p>
                  <span className="dropzone-subtext">Supports PDF, DOCX, or RTF (max 10MB)</span>
                </div>

                {/* Uploaded File Item Preview */}
                {attachedResume && (
                  <div className="uploaded-file-row">
                    <div className="file-info-left">
                      <div className="file-type-icon-wrap">
                        <FilePdfIcon />
                      </div>
                      <div className="file-details">
                        <span className="file-name">{attachedResume.name}</span>
                        <span className="file-meta">
                          {attachedResume.size} • {attachedResume.status}
                        </span>
                      </div>
                    </div>

                    <div className="file-info-right">
                      {attachedResume.isSynced && (
                        <span className="file-synced-badge">
                          <CheckCircleIcon />
                          <span>Synced</span>
                        </span>
                      )}
                      <button
                        type="button"
                        className="file-remove-btn"
                        title="Remove resume"
                        onClick={handleRemoveResume}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pro Strategy Banner */}
              <div className="pro-strategy-callout">
                <div className="strategy-icon-wrap">
                  <InfoIcon />
                </div>
                <p className="strategy-text">
                  <strong className="strategy-highlight">Pro Strategy:</strong> Pairing both an up-to-date resume and a focused
                  self description delivers up to <strong className="strategy-stat">40% more targeted interview questions</strong> and
                  personalized response frameworks.
                </p>
              </div>
            </div>

            {/* Bottom Card: Self Description & Focus Areas */}
            <div className="custom-card self-description-card">
              <div className="card-header">
                <div className="card-header-left">
                  <span className="card-status-dot dot-red" />
                  <h2 className="card-title">Self Description & Focus Areas</h2>
                </div>
                <span className="card-header-label">Optional but recommended</span>
              </div>

              {/* Helper Tags & Dictate */}
              <div className="self-desc-tools-row">
                <div className="quick-tags-wrap">
                  <button
                    type="button"
                    className="quick-tag-chip"
                    onClick={() => handleAddTag("Highlight Leadership")}
                  >
                    + Highlight Leadership
                  </button>
                  <button
                    type="button"
                    className="quick-tag-chip"
                    onClick={() => handleAddTag("System Architecture")}
                  >
                    + System Architecture
                  </button>
                </div>

                <button
                  type="button"
                  className={`dictate-tool-btn ${isDictating ? "active" : ""}`}
                  onClick={handleToggleDictate}
                >
                  <MicIcon />
                  <span>{isDictating ? "Listening..." : "Dictate"}</span>
                </button>
              </div>

              {/* Self Description Textarea */}
              <div className="self-desc-textarea-wrap">
                <textarea
                  id="selfDescription"
                  name="selfDescription"
                  className="self-desc-textarea"
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  placeholder="Describe yourself in a few sentences, key career pivots, accomplishments you want to highlight, or specific interview anxiety topics you wish to practice..."
                  rows={4}
                />
              </div>

              {/* Evaluation Focus & Rigor */}
              <div className="rigor-section">
                <span className="rigor-section-label">EVALUATION FOCUS & RIGOR</span>
                <div className="rigor-checkbox-grid">
                  {/* System Design */}
                  <div
                    className={`rigor-option-card ${rigorOptions.systemDesign ? "checked" : ""}`}
                    onClick={() => handleToggleRigor("systemDesign")}
                    role="checkbox"
                    aria-checked={rigorOptions.systemDesign}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleToggleRigor("systemDesign")}
                  >
                    <span className="rigor-option-title">System Design</span>
                    <span className="custom-checkbox-box">
                      {rigorOptions.systemDesign && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  </div>

                  {/* Behavioral / STAR */}
                  <div
                    className={`rigor-option-card ${rigorOptions.behavioralStar ? "checked" : ""}`}
                    onClick={() => handleToggleRigor("behavioralStar")}
                    role="checkbox"
                    aria-checked={rigorOptions.behavioralStar}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleToggleRigor("behavioralStar")}
                  >
                    <span className="rigor-option-title">Behavioral / STAR</span>
                    <span className="custom-checkbox-box">
                      {rigorOptions.behavioralStar && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  </div>

                  {/* Coding & Algorithmic */}
                  <div
                    className={`rigor-option-card ${rigorOptions.codingAlgorithmic ? "checked" : ""}`}
                    onClick={() => handleToggleRigor("codingAlgorithmic")}
                    role="checkbox"
                    aria-checked={rigorOptions.codingAlgorithmic}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleToggleRigor("codingAlgorithmic")}
                  >
                    <span className="rigor-option-title">Coding & Algorithmic</span>
                    <span className="custom-checkbox-box">
                      {rigorOptions.codingAlgorithmic && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            3. PRIMARY ACTION CTA: "Generate Interview Report"
            ------------------------------------------------------------- */}
        <div className="report-cta-container">
          <button
            type="button"
            className={`generate-report-cta-btn ${isGenerating ? "generating" : ""}`}
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            <div className="cta-inner-content">
              <SparklesIcon />
              <span className="cta-label">
                {isGenerating ? "Synthesizing Custom Report..." : "Generate Interview Report"}
              </span>
            </div>
          </button>

          <div className="cta-meta-row">
            <div className="meta-build-time">
              <ClockIcon />
              <span>Estimated build time: ~20 seconds</span>
            </div>

            <button type="button" className="meta-settings-link">
              <span>Detailed Output Settings</span>
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
