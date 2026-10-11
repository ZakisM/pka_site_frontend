import { useEffect, useRef } from "react";
import { smoothScroll } from "@/lib/motion";

interface HitKeysOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  resetKey: unknown;
  // The query the rows on screen belong to, and whether they are still the
  // Previous query's placeholder. Enter must not play a row for a query the
  // Box has already moved past.
  query: string;
  current: boolean;
}

/**
 * ↑/↓ walk the visible hits and Enter plays one, while focus stays in the
 * Search box. The selection is a DOM attribute rather than React state so a
 * Keypress never re-renders a list that may hold hundreds of rows.
 */
export const useHitKeys = ({ containerRef, resetKey, query, current }: HitKeysOptions) => {
  const selectedRef = useRef(-1);
  const rowsForRef = useRef({ query, current });

  useEffect(() => {
    rowsForRef.current = { query, current };
  }, [query, current]);

  useEffect(() => {
    selectedRef.current = -1;
    const selected = containerRef.current?.querySelector<HTMLElement>("[data-selected]");

    if (selected) {
      delete selected.dataset.selected;
    }
    // `resetKey` is the trigger: new rows start with nothing selected.
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [containerRef, resetKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const fromSearch =
        !event.defaultPrevented &&
        event.target instanceof HTMLElement &&
        event.target.dataset.searchInput !== undefined;
      const hits = [...(containerRef.current?.querySelectorAll<HTMLElement>("[data-hit]") ?? [])];

      if (!fromSearch || hits.length === 0) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const typed = event.target instanceof HTMLInputElement ? event.target.value.trim() : "";
        const rows = rowsForRef.current;

        if (rows.current && typed === rows.query) {
          hits[Math.max(0, selectedRef.current)]?.click();
        }

        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      event.preventDefault();
      const previous = hits[selectedRef.current];

      if (previous) {
        delete previous.dataset.selected;
      }

      selectedRef.current = Math.min(
        hits.length - 1,
        Math.max(0, selectedRef.current + (event.key === "ArrowDown" ? 1 : -1)),
      );

      const hit = hits[selectedRef.current];

      if (hit) {
        hit.dataset.selected = "";
        // Glides for a single press; a held key moves too fast to animate.
        hit.scrollIntoView({ block: "nearest", behavior: event.repeat ? "instant" : smoothScroll() });
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [containerRef]);
};
