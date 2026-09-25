import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/hooks/useAuth";

/**
 * Data adapter hook for tracking interview preparation progress and roadmap task completions.
 * Strictly scopes checklist progress and activity logs to the authenticated user ID
 * so a new user never inherits any other user's milestones or tasks.
 */
export const usePreparationProgress = (activeReport) => {
  const { user } = useAuth();
  const userId = user?.id || user?._id || user?.email || "anonymous";
  const reportId = activeReport?._id;
  const storageKey = reportId ? `hirepilot_prep_${userId}_${reportId}` : null;
  const activityKey = `hirepilot_activity_log_${userId}`;

  const [completedTasks, setCompletedTasks] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // Clean up any legacy un-scoped activity log to prevent data cross-contamination
  useEffect(() => {
    try {
      localStorage.removeItem("hirepilot_activity_log");
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load completed tasks for the current user's active report
  useEffect(() => {
    if (!storageKey) {
      setCompletedTasks([]);
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCompletedTasks(JSON.parse(stored));
      } else {
        setCompletedTasks([]);
      }
    } catch (e) {
      console.error("Failed to load preparation progress:", e);
      setCompletedTasks([]);
    }
  }, [storageKey]);

  // Load user-scoped persistent activity log
  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem(activityKey);
      if (storedActivities) {
        setActivityLog(JSON.parse(storedActivities));
      } else {
        setActivityLog([]);
      }
    } catch (e) {
      console.error("Failed to load activity log:", e);
      setActivityLog([]);
    }
  }, [activityKey]);

  const addActivity = useCallback(
    (type, message, metadata = {}) => {
      const newEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type, // 'plan_created' | 'task_completed' | 'resume_downloaded'
        message,
        timestamp: new Date().toISOString(),
        ...metadata,
      };
      setActivityLog((prev) => {
        const updated = [newEntry, ...prev].slice(0, 20); // Keep last 20
        try {
          localStorage.setItem(activityKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save activity:", e);
        }
        return updated;
      });
    },
    [activityKey]
  );

  const toggleTask = useCallback(
    (taskId, taskDescription) => {
      if (!storageKey) return;
      setCompletedTasks((prev) => {
        const isCompleted = prev.includes(taskId);
        const updated = isCompleted
          ? prev.filter((id) => id !== taskId)
          : [...prev, taskId];

        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save task status:", e);
        }

        if (!isCompleted) {
          addActivity(
            "task_completed",
            `Completed task: "${taskDescription.substring(0, 40)}${taskDescription.length > 40 ? "..." : ""}"`,
            { reportId, reportTitle: activeReport?.title }
          );
        }

        return updated;
      });
    },
    [storageKey, addActivity, reportId, activeReport?.title]
  );

  return {
    completedTasks,
    toggleTask,
    activityLog,
    addActivity,
  };
};
