import { type SearchRow, selectedIndexAtom } from "./searchState";
import { useSetAtom, useStore } from "jotai";
import type { VListHandle } from "virtua";
import { useEffect } from "react";

interface SearchKeysOptions {
  rows: SearchRow[];
  listRef: React.RefObject<VListHandle | null>;
  onPlay: (row: SearchRow, fromStart: boolean) => void;
}

/**
 * ↑↓ moves the selection, ↵ plays it, ⇧↵ opens the episode from the start.
 *
 * The selection is read from the store rather than subscribed to: this lives
 * Beside a list of up to 35k rows, and re-rendering that on every keystroke is
 * What made the panel feel slow.
 */
export const useSearchKeys = ({ rows, listRef, onPlay }: SearchKeysOptions) => {
  const store = useStore();
  const setSelectedIndex = useSetAtom(selectedIndexAtom);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (rows.length === 0) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        const step = event.key === "ArrowDown" ? 1 : -1;
        const next = Math.min(
          rows.length - 1,
          Math.max(0, store.get(selectedIndexAtom) + step),
        );

        setSelectedIndex(next);
        listRef.current?.scrollToIndex(next, { align: "nearest" });

        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const row = rows[store.get(selectedIndexAtom)];

        if (row) {
          onPlay(row, event.shiftKey);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [rows, listRef, onPlay, store, setSelectedIndex]);
};
