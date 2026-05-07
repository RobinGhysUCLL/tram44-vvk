// Storage utility with fallback for in-app browsers (Messenger, Instagram, etc.)
// These browsers often block sessionStorage for privacy reasons

/**
 * Detect if we're in an in-app browser (Facebook, Messenger, Instagram, etc.)
 */
export function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for common in-app browser user agents
  return (
    ua.includes("FBAN") || // Facebook App
    ua.includes("FBAV") || // Facebook App
    ua.includes("Instagram") ||
    ua.includes("Messenger") ||
    ua.includes("Line/") ||
    ua.includes("WhatsApp") ||
    ua.includes("Twitter") ||
    ua.includes("FB_IAB") || // Facebook In-App Browser
    ua.includes("FB4A") // Facebook for Android
  );
}

/**
 * Check if storage is actually available (not blocked)
 */
function isStorageAvailable(type: "localStorage" | "sessionStorage"): boolean {
  if (typeof window === "undefined") return false;

  try {
    const storage = window[type];
    const testKey = "__storage_test__";
    storage.setItem(testKey, "test");
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safe storage wrapper that falls back when blocked
 * Priority: sessionStorage -> localStorage -> memory
 */
class SafeStorage {
  private memoryStorage = new Map<string, string>();
  private useSession = false;
  private useLocal = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.useSession = isStorageAvailable("sessionStorage");
      this.useLocal = isStorageAvailable("localStorage");
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (this.useSession) {
        sessionStorage.setItem(key, value);
      } else if (this.useLocal) {
        localStorage.setItem(key, value);
      } else {
        this.memoryStorage.set(key, value);
      }
    } catch (e) {
      console.warn("Storage blocked, using memory fallback");
      this.memoryStorage.set(key, value);
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.useSession) {
        return sessionStorage.getItem(key);
      } else if (this.useLocal) {
        return localStorage.getItem(key);
      } else {
        return this.memoryStorage.get(key) || null;
      }
    } catch (e) {
      console.warn("Storage blocked, using memory fallback");
      return this.memoryStorage.get(key) || null;
    }
  }

  removeItem(key: string): void {
    try {
      if (this.useSession) {
        sessionStorage.removeItem(key);
      } else if (this.useLocal) {
        localStorage.removeItem(key);
      } else {
        this.memoryStorage.delete(key);
      }
    } catch (e) {
      this.memoryStorage.delete(key);
    }
  }

  get isBlocked(): boolean {
    return !this.useSession && !this.useLocal;
  }

  get storageType(): "session" | "local" | "memory" {
    if (this.useSession) return "session";
    if (this.useLocal) return "local";
    return "memory";
  }
}

// Export a singleton instance
export const storage = new SafeStorage();
