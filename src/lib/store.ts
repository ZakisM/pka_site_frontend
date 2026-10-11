import { useSyncExternalStore } from "react";

/**
 * A value that lives outside React — read anywhere, set from anywhere, and
 * rendered through `useStore`. App state that outlives a screen lives in these.
 */
export interface Store<T> {
  get: () => T;
  set: (next: T | ((previous: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

export const createStore = <T>(initial: T, onChange?: (value: T) => void): Store<T> => {
  let value = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    set: (next) => {
      const resolved = typeof next === "function" ? (next as (previous: T) => T)(value) : next;

      if (Object.is(resolved, value)) {
        return;
      }

      value = resolved;
      onChange?.(value);

      for (const listener of listeners) {
        listener();
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const useStore = <T>(store: Store<T>) => useSyncExternalStore(store.subscribe, store.get);
