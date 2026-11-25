import { useEffect, useState } from "react";

const getStorageKey = (page, field, userId) =>
  `billapp.pageDraft.${userId ?? "anonymous"}.${page}.${field}`;

export default function useSessionDraftState(
  page,
  field,
  initialValue,
  userId,
  enabled = true
) {
  const storageKey = getStorageKey(page, field, userId);
  const [savedState] = useState(() => {
    try {
      const savedValue = sessionStorage.getItem(storageKey);

      return savedValue === null
        ? { value: initialValue, hasSavedValue: false }
        : { value: JSON.parse(savedValue), hasSavedValue: true };
    } catch (error) {
      console.error(`Unable to restore ${page} draft:`, error);
      return { value: initialValue, hasSavedValue: false };
    }
  });
  const [value, setValue] = useState(savedState.value);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Unable to save ${page} draft:`, error);
    }
  }, [enabled, page, storageKey, value]);

  return [value, setValue, savedState.hasSavedValue];
}
