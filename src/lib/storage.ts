// Web storage that never throws: a private window, blocked site data or a
// Full quota only costs persistence, never the page.

export const readJson = (storage: () => Storage, key: string): unknown => {
  try {
    const raw = storage().getItem(key);

    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export const writeJson = (storage: () => Storage, key: string, value: unknown) => {
  try {
    storage().setItem(key, JSON.stringify(value));
  } catch {
    // Nothing to fall back to; the value still holds for this page.
  }
};

export const storageKeys = (storage: () => Storage) => {
  try {
    const store = storage();

    return Array.from({ length: store.length }, (_, index) => store.key(index)).filter(
      (key) => key !== null,
    );
  } catch {
    return [];
  }
};
