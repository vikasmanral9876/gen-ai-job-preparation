import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/hooks/useAuth";

// Blank profile for brand-new users - no auto-generated or dummy profile pre-population
const EMPTY_PROFILE = {
  title: "",
  bio: "",
  location: "",
  website: "",
  avatarUrl: null,
  skills: [],
  experience: [],
  education: [],
};

// Helper to detect if a stored profile contains the legacy dummy template
const isDummyTemplate = (p) => {
  if (!p) return false;
  const hasDummyExp = p.experience?.some(
    (e) => e.company === "CloudScale Systems" || e.company === "DataVibe Technologies"
  );
  const hasDummyEdu = p.education?.some(
    (e) => e.institution === "State University of Science & Technology"
  );
  return Boolean(hasDummyExp || hasDummyEdu);
};

export const useCandidateProfile = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id || user?.email || "candidate_user";
  const storageKey = `hirepilot_candidate_profile_${userId}`;

  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!isDummyTemplate(parsed)) {
          return { ...EMPTY_PROFILE, ...parsed };
        }
        // Purge legacy dummy template so new user starts completely fresh
        localStorage.removeItem(storageKey);
      }
    } catch (e) {
      console.error("Failed to load profile from localStorage:", e);
    }
    return EMPTY_PROFILE;
  });

  // Sync if userId changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!isDummyTemplate(parsed)) {
          setProfile({ ...EMPTY_PROFILE, ...parsed });
          return;
        }
        localStorage.removeItem(storageKey);
      }
      setProfile(EMPTY_PROFILE);
    } catch (e) {
      console.error("Failed to load profile on user change:", e);
      setProfile(EMPTY_PROFILE);
    }
  }, [storageKey]);

  const saveProfile = useCallback(
    (newProfile) => {
      setProfile(newProfile);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newProfile));
      } catch (e) {
        console.error("Failed to save candidate profile:", e);
      }
    },
    [storageKey]
  );

  const updateProfileFields = useCallback(
    (fields) => {
      setProfile((prev) => {
        const updated = { ...prev, ...fields };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to update profile fields:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const addSkill = useCallback(
    (skill) => {
      const trimmed = skill.trim();
      if (!trimmed) return;
      setProfile((prev) => {
        const skillsList = prev.skills || [];
        if (skillsList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
          return prev;
        }
        const updated = { ...prev, skills: [...skillsList, trimmed] };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to add skill:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const removeSkill = useCallback(
    (skillToRemove) => {
      setProfile((prev) => {
        const skillsList = prev.skills || [];
        const updated = {
          ...prev,
          skills: skillsList.filter((s) => s !== skillToRemove),
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to remove skill:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const addExperience = useCallback(
    (exp) => {
      setProfile((prev) => {
        const expList = prev.experience || [];
        const newExp = {
          ...exp,
          id: `exp_${Date.now()}`,
        };
        const updated = { ...prev, experience: [newExp, ...expList] };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to add experience:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const updateExperience = useCallback(
    (id, updatedFields) => {
      setProfile((prev) => {
        const expList = prev.experience || [];
        const updated = {
          ...prev,
          experience: expList.map((item) =>
            item.id === id ? { ...item, ...updatedFields } : item
          ),
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to update experience:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const deleteExperience = useCallback(
    (id) => {
      setProfile((prev) => {
        const expList = prev.experience || [];
        const updated = {
          ...prev,
          experience: expList.filter((item) => item.id !== id),
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to delete experience:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const addEducation = useCallback(
    (edu) => {
      setProfile((prev) => {
        const eduList = prev.education || [];
        const newEdu = {
          ...edu,
          id: `edu_${Date.now()}`,
        };
        const updated = { ...prev, education: [newEdu, ...eduList] };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to add education:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const updateEducation = useCallback(
    (id, updatedFields) => {
      setProfile((prev) => {
        const eduList = prev.education || [];
        const updated = {
          ...prev,
          education: eduList.map((item) =>
            item.id === id ? { ...item, ...updatedFields } : item
          ),
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to update education:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const deleteEducation = useCallback(
    (id) => {
      setProfile((prev) => {
        const eduList = prev.education || [];
        const updated = {
          ...prev,
          education: eduList.filter((item) => item.id !== id),
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to delete education:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  return {
    profile,
    saveProfile,
    updateProfileFields,
    addSkill,
    removeSkill,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
  };
};
