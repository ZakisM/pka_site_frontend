import { useSyncExternalStore } from "react";

/**
 * A value that lives outside React — read anywhere, set from anywhere, and
 * rendered through `useStore`. App state that outlives a screen lives in these.
 */
export interface Store<T> {
  get: () => T;
  set: (next: T) => void;
  update: (change: (previous: T) => T) => void;
  subscribe: (listener: () => void) => () => void;
}

export const createStore = <T>(initial: T, onChange?: (value: T) => void): Store<T> => {
  let value = initial;
  const listeners = new Set<() => void>();

  const set = (next: T) => {
    if (Object.is(next, value)) {
      return;
    }

    value = next;
    onChange?.(value);

    for (const listener of listeners) {
      listener();
    }
  };

  return {
    get: () => value,
    set,
    update: (change) => {
      set(change(value));
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
