/**
 * Utility for persisting staged resume file across browser sessions / page transitions using IndexedDB.
 */
const DB_NAME = "hirepilot_resume_db";
const STORE_NAME = "staged_resumes";
const RESUME_KEY = "current_staged_resume";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported in this environment"));
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a staged resume File/Blob to IndexedDB.
 * @param {File|Blob} file
 */
export async function saveStagedResume(file) {
  if (!file) return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(file, RESUME_KEY);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Failed to persist staged resume to IndexedDB:", err);
  }
}

/**
 * Retrieve the current staged resume File from IndexedDB.
 * @returns {Promise<File|null>}
 */
export async function getStagedResume() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(RESUME_KEY);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (!result) return resolve(null);
        if (result instanceof File) {
          resolve(result);
        } else if (result instanceof Blob) {
          const file = new File([result], result.name || "resume.pdf", {
            type: result.type || "application/pdf",
            lastModified: result.lastModified || Date.now(),
          });
          resolve(file);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to retrieve staged resume from IndexedDB:", err);
    return null;
  }
}

/**
 * Clear the staged resume from IndexedDB.
 */
export async function clearStagedResume() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(RESUME_KEY);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Failed to clear staged resume from IndexedDB:", err);
  }
}
