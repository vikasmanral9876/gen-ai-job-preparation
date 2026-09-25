import { useState, useEffect, useCallback } from "react";

/**
 * Data adapter hook for tracking interview preparation progress and roadmap task completions.
 * Uses localStorage to persist user roadmap checklist progress for active interview plans
 * and logs real user milestone activities.
 */
export const usePreparationProgress = (activeReport) => {
  const reportId = activeReport?._id;
  const storageKey = reportId ? `hirepilot_prep_${reportId}` : null;
  const activityKey = "hirepilot_activity_log";

  const [completedTasks, setCompletedTasks] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // Load completed tasks for current active report
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

  // Load persistent activity log
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
    }
  }, []);

  const addActivity = useCallback((type, message, metadata = {}) => {
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
  }, []);

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
