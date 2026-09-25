import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/hooks/useAuth";

const DEFAULT_PROFILE = {
  title: "Senior Full Stack Engineer",
  bio: "Passionate engineer specializing in high-performance web applications, scalable distributed architectures, and AI-native products.",
  location: "San Francisco, CA / Remote",
  website: "https://hirepilot.ai",
  avatarUrl: null,
  skills: [
    "JavaScript (ES6+)",
    "TypeScript",
    "React / Next.js",
    "Node.js & Express",
    "System Design",
    "PostgreSQL & MongoDB",
    "REST & GraphQL APIs",
    "Docker & CI/CD",
  ],
  experience: [
    {
      id: "exp_1",
      role: "Senior Full Stack Engineer",
      company: "CloudScale Systems",
      period: "2023 - Present",
      location: "San Francisco, CA (Remote)",
      description:
        "Led architecture for AI-assisted workflow engines and interactive candidate preparation pipelines with 99.9% reliability.",
    },
    {
      id: "exp_2",
      role: "Software Engineer",
      company: "DataVibe Technologies",
      period: "2021 - 2023",
      location: "Austin, TX",
      description:
        "Engineered real-time dashboard analytics, high-throughput microservices, and modern UI components used by 100k+ active candidates.",
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "State University of Science & Technology",
      degree: "B.S. in Computer Science",
      period: "2017 - 2021",
      description:
        "Graduated Magna Cum Laude. Specialization in Software Systems, Data Structures, and Human-Computer Interaction.",
    },
  ],
};

export const useCandidateProfile = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id || user?.email || "candidate_user";
  const storageKey = `hirepilot_candidate_profile_${userId}`;

  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load profile from localStorage:", e);
    }
    return DEFAULT_PROFILE;
  });

  // Sync if userId changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        setProfile(DEFAULT_PROFILE);
      }
    } catch (e) {
      console.error("Failed to load profile on user change:", e);
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
        if (prev.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
          return prev;
        }
        const updated = { ...prev, skills: [...prev.skills, trimmed] };
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
        const updated = {
          ...prev,
          skills: prev.skills.filter((s) => s !== skillToRemove),
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
        const newExp = {
          ...exp,
          id: `exp_${Date.now()}`,
        };
        const updated = { ...prev, experience: [newExp, ...prev.experience] };
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
        const updated = {
          ...prev,
          experience: prev.experience.map((item) =>
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
        const updated = {
          ...prev,
          experience: prev.experience.filter((item) => item.id !== id),
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
        const newEdu = {
          ...edu,
          id: `edu_${Date.now()}`,
        };
        const updated = { ...prev, education: [newEdu, ...prev.education] };
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
        const updated = {
          ...prev,
          education: prev.education.map((item) =>
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
        const updated = {
          ...prev,
          education: prev.education.filter((item) => item.id !== id),
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
