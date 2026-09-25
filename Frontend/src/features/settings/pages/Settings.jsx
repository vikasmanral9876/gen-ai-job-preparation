import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import "../settings.scss";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Bell,
  Moon,
  ShieldCheck,
  Key,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from "../../../components/ui/Icons";

const Settings = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account"); // 'account' | 'notifications' | 'appearance' | 'security' | 'password' | 'logout'
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setErrorMessage("");
    setTimeout(() => setToastMessage(""), 3500);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 4000);
  };

  // Account State
  const [accountForm, setAccountForm] = useState({
    username: user?.username || "Candidate",
    email: user?.email || "candidate@hirepilot.ai",
    preferredRole: "Senior Full Stack Engineer",
    timezone: "UTC-08:00 (Pacific Time - Los Angeles)",
  });

  // Notification State
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem("hirepilot_settings_notifications");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      roadmapReminders: true,
      planCompletion: true,
      weeklyDigest: false,
      productUpdates: true,
    };
  });

  // Appearance State
  const [appearance, setAppearance] = useState(() => {
    try {
      const stored = localStorage.getItem("hirepilot_settings_appearance");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      theme: "dark",
      accentColor: "#ff2d78",
      density: "comfortable",
    };
  });

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Save account settings
  const handleSaveAccount = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("hirepilot_settings_account", JSON.stringify(accountForm));
      showToast("Account preferences updated successfully");
    } catch (e) {
      showError("Failed to save account settings");
    }
  };

  // Save notification toggle
  const handleToggleNotification = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("hirepilot_settings_notifications", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast("Notification preferences updated");
  };

  // Save appearance change
  const handleUpdateAppearance = (field, val) => {
    setAppearance((prev) => {
      const updated = { ...prev, [field]: val };
      try {
        localStorage.setItem("hirepilot_settings_appearance", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast(`Appearance updated: ${val}`);
  };

  // Handle password submit
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showError("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showError("New password must be at least 6 characters in length.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError("New passwords do not match. Please re-check.");
      return;
    }

    // Simulated secure credential refresh
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    showToast("Password updated successfully. Next session will require new credentials.");
  };

  // Handle Logout
  const onConfirmLogout = async () => {
    await handleLogout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="settings-page">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="profile-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <section className="settings-header">
        <div className="settings-header__badge">
          <SettingsIcon size={13} />
          <span>Platform Settings</span>
        </div>
        <h1>Settings & Preferences</h1>
        <p>
          Manage your account profile, notification triggers, system appearance, and authentication security.
        </p>
      </section>

      {/* Settings Grid */}
      <div className="settings-layout">
        {/* Navigation Tabs */}
        <aside className="settings-tabs">
          <button
            type="button"
            className={`settings-tabs__tab ${
              activeTab === "account" ? "settings-tabs__tab--active" : ""
            }`}
            onClick={() => setActiveTab("account")}
          >
            <UserIcon size={16} />
            <span>Account Settings</span>
          </button>

          <button
            type="button"
            className={`settings-tabs__tab ${
              activeTab === "notifications" ? "settings-tabs__tab--active" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={16} />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            className={`settings-tabs__tab ${
              activeTab === "appearance" ? "settings-tabs__tab--active" : ""
            }`}
            onClick={() => setActiveTab("appearance")}
          >
            <Moon size={16} />
            <span>Appearance</span>
          </button>

          <button
            type="button"
            className={`settings-tabs__tab ${
              activeTab === "security" ? "settings-tabs__tab--active" : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            <ShieldCheck size={16} />
            <span>Security & Sessions</span>
          </button>

          <button
            type="button"
            className={`settings-tabs__tab ${
              activeTab === "password" ? "settings-tabs__tab--active" : ""
            }`}
            onClick={() => setActiveTab("password")}
          >
            <Key size={16} />
            <span>Change Password</span>
          </button>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "4px 0" }} />

          <button
            type="button"
            className="settings-tabs__tab settings-tabs__tab--danger"
            onClick={() => setActiveTab("logout")}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="settings-content">
          {/* TAB 1: ACCOUNT SETTINGS */}
          {activeTab === "account" && (
            <div>
              <div className="settings-content__header">
                <h2>Account Settings</h2>
                <p>Update your personal information and default career role preferences.</p>
              </div>

              <form className="settings-form" onSubmit={handleSaveAccount}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="username">Full Name / Username</label>
                    <input
                      id="username"
                      type="text"
                      required
                      value={accountForm.username}
                      onChange={(e) =>
                        setAccountForm((prev) => ({ ...prev, username: e.target.value }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      disabled
                      value={accountForm.email}
                      title="Email address is associated with your primary HirePilot credentials"
                    />
                    <span className="hint">Managed via primary authentication credentials</span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preferredRole">Target Position Title</label>
                    <input
                      id="preferredRole"
                      type="text"
                      placeholder="e.g. Senior Backend Engineer"
                      value={accountForm.preferredRole}
                      onChange={(e) =>
                        setAccountForm((prev) => ({ ...prev, preferredRole: e.target.value }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="timezone">Timezone</label>
                    <select
                      id="timezone"
                      value={accountForm.timezone}
                      onChange={(e) =>
                        setAccountForm((prev) => ({ ...prev, timezone: e.target.value }))
                      }
                    >
                      <option value="UTC-08:00 (Pacific Time - Los Angeles)">
                        UTC-08:00 (Pacific Time - Los Angeles)
                      </option>
                      <option value="UTC-05:00 (Eastern Time - New York)">
                        UTC-05:00 (Eastern Time - New York)
                      </option>
                      <option value="UTC+00:00 (London, Dublin)">
                        UTC+00:00 (London, Dublin)
                      </option>
                      <option value="UTC+01:00 (Central European Time - Berlin)">
                        UTC+01:00 (Central European Time - Berlin)
                      </option>
                      <option value="UTC+05:30 (India Standard Time - New Delhi)">
                        UTC+05:30 (India Standard Time - New Delhi)
                      </option>
                      <option value="UTC+08:00 (Singapore / Hong Kong)">
                        UTC+08:00 (Singapore / Hong Kong)
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <button type="submit" className="btn-primary">
                    <Save size={14} />
                    <span>Save Account Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div>
              <div className="settings-content__header">
                <h2>Notification Preferences</h2>
                <p>Configure which automated alerts and reminders HirePilot delivers to you.</p>
              </div>

              <div>
                <div className="toggle-item">
                  <div className="toggle-item__info">
                    <span className="title">Roadmap Milestone Reminders</span>
                    <span className="desc">
                      Receive proactive notifications when preparation roadmap tasks are scheduled.
                    </span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.roadmapReminders}
                      onChange={() => handleToggleNotification("roadmapReminders")}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-item__info">
                    <span className="title">Interview Plan Completion Alerts</span>
                    <span className="desc">
                      Notify you as soon as the Gemini AI engine finishes parsing your resume and questions.
                    </span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.planCompletion}
                      onChange={() => handleToggleNotification("planCompletion")}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-item__info">
                    <span className="title">Weekly Candidate Readiness Digest</span>
                    <span className="desc">
                      A summary email showcasing match score progress and skill gap closing metrics.
                    </span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.weeklyDigest}
                      onChange={() => handleToggleNotification("weeklyDigest")}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-item__info">
                    <span className="title">Product & AI Model Updates</span>
                    <span className="desc">
                      Stay informed about new interview generation frameworks and ATS optimizations.
                    </span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.productUpdates}
                      onChange={() => handleToggleNotification("productUpdates")}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE */}
          {activeTab === "appearance" && (
            <div>
              <div className="settings-content__header">
                <h2>Interface & Visual Appearance</h2>
                <p>Customize the visual presentation and accent palette of your HirePilot dashboard.</p>
              </div>

              <div className="settings-form">
                <div className="form-group">
                  <label>Interface Theme</label>
                  <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                    <button
                      type="button"
                      className={`btn-secondary ${
                        appearance.theme === "dark" ? "btn-secondary--active" : ""
                      }`}
                      style={{
                        borderColor: appearance.theme === "dark" ? "#ff2d78" : undefined,
                        background: appearance.theme === "dark" ? "rgba(255,45,120,0.12)" : undefined,
                      }}
                      onClick={() => handleUpdateAppearance("theme", "dark")}
                    >
                      <Moon size={14} />
                      <span>HirePilot Dark (Default)</span>
                    </button>
                  </div>
                  <span className="hint">HirePilot is optimized for dark mode to prevent visual fatigue during interview prep.</span>
                </div>

                <div className="form-group" style={{ marginTop: "12px" }}>
                  <label>Primary Accent Tone</label>
                  <div className="color-picker-row">
                    <div
                      className={`color-option ${
                        appearance.accentColor === "#ff2d78" ? "color-option--active" : ""
                      }`}
                      onClick={() => handleUpdateAppearance("accentColor", "#ff2d78")}
                    >
                      <span className="dot" style={{ background: "#ff2d78" }} />
                      <span>Neon Magenta (Official)</span>
                    </div>

                    <div
                      className={`color-option ${
                        appearance.accentColor === "#06b6d4" ? "color-option--active" : ""
                      }`}
                      onClick={() => handleUpdateAppearance("accentColor", "#06b6d4")}
                    >
                      <span className="dot" style={{ background: "#06b6d4" }} />
                      <span>Electric Cyan</span>
                    </div>

                    <div
                      className={`color-option ${
                        appearance.accentColor === "#8b5cf6" ? "color-option--active" : ""
                      }`}
                      onClick={() => handleUpdateAppearance("accentColor", "#8b5cf6")}
                    >
                      <span className="dot" style={{ background: "#8b5cf6" }} />
                      <span>Cyber Violet</span>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: "12px" }}>
                  <label htmlFor="density">Dashboard Density</label>
                  <select
                    id="density"
                    value={appearance.density}
                    onChange={(e) => handleUpdateAppearance("density", e.target.value)}
                  >
                    <option value="comfortable">Comfortable (Standard spacing)</option>
                    <option value="compact">Compact (High data density)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === "security" && (
            <div>
              <div className="settings-content__header">
                <h2>Security & Sessions</h2>
                <p>Review active authenticated browser sessions and account protection status.</p>
              </div>

              <div className="toggle-item">
                <div className="toggle-item__info">
                  <span className="title">Two-Factor Authentication (2FA)</span>
                  <span className="desc">
                    Require a one-time verification passcode in addition to your password upon signing in.
                  </span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showToast(
                        !twoFactorEnabled
                          ? "2FA enabled for your account"
                          : "2FA disabled"
                      );
                    }}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div style={{ marginTop: "24px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>
                  Active Device Session
                </span>

                <div className="session-card">
                  <div className="session-card__left">
                    <div className="icon-box">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div className="device-name">Current Web Client • Windows (Chrome)</div>
                      <div className="device-info">
                        Active Now • Localhost (127.0.0.1) • Authenticated JWT
                      </div>
                    </div>
                  </div>
                  <span className="badge-current">This Device</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHANGE PASSWORD */}
          {activeTab === "password" && (
            <div>
              <div className="settings-content__header">
                <h2>Change Password</h2>
                <p>Update your password to keep your candidate account and resume data protected.</p>
              </div>

              {errorMessage && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px",
                    marginBottom: "16px",
                    borderRadius: "8px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    fontSize: "12px",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="settings-form" onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      required
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#6b7280",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      required
                      placeholder="Minimum 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#6b7280",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      required
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#6b7280",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <button type="submit" className="btn-primary">
                    <Key size={14} />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: LOGOUT / DANGER ZONE */}
          {activeTab === "logout" && (
            <div>
              <div className="settings-content__header">
                <h2>Account Sign Out</h2>
                <p>Terminating your session will clear your secure cookies and return you to the login screen.</p>
              </div>

              <div className="danger-zone">
                <h3>Sign Out from HirePilot</h3>
                <p>
                  Are you sure you want to log out? Any unsaved interview strategy generation in progress will be halted, but your saved plans and roadmap milestones are safely stored.
                </p>

                <button
                  type="button"
                  className="btn-danger"
                  onClick={onConfirmLogout}
                >
                  <LogOut size={14} />
                  <span>Confirm Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
