import { useState } from "react";

/**
 * A hook that mirrors useState but persists the value in sessionStorage.
 * Data is cleared when the browser tab is closed, making it suitable for
 * form progress that should survive page refreshes but not persist indefinitely.
 *
 * @param key - sessionStorage key
 * @param initialValue - default value if nothing is stored
 * @returns [value, setValue, clearValue]
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // If sessionStorage is unavailable (e.g. private browsing restrictions),
      // fall back to in-memory state only.
      setStoredValue(value);
    }
  };

  const removeValue = () => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    setStoredValue(initialValue);
  };

  return [storedValue, setValue, removeValue];
}
