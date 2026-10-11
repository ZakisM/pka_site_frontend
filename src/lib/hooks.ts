import { useEffect, useRef, useState } from "react";

// Trails a fast-changing value so effects downstream fire once it settles.
export const useDebounced = <T,>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timerId);
  }, [value, delayMs]);

  return debounced;
};

// Lets a component skip rendering — and so skip fetching for — UI that CSS
// Would only have hidden.
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => globalThis.matchMedia?.(query).matches ?? false,
  );

  useEffect(() => {
    const media = globalThis.matchMedia(query);
    const onChange = () => setMatches(media.matches);

    onChange();
    media.addEventListener("change", onChange);

    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};

/**
 * A ref for an element at the end of a list; `onReach` runs whenever it comes
 * Within a screen or so of view. `generation` should change each time the
 * List grows: re-observing makes the observer report again if the end is
 * Still in range, so a tall screen keeps filling itself.
 */
interface SentinelOptions {
  onReach: () => void;
  enabled: boolean;
  generation: number;
  // The scrolling element, when the list scrolls inside one rather than the
  // Page; the look-ahead margin only applies to the observer's root.
  scrollRoot?: React.RefObject<HTMLElement | null>;
}

export const useSentinel = ({ onReach, enabled, generation, scrollRoot }: SentinelOptions) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onReach();
        }
      },
      { root: scrollRoot?.current ?? null, rootMargin: "1200px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onReach, enabled, generation, scrollRoot]);

  return sentinelRef;
};

// How far each list had been revealed, so coming back to it (Back from an
// Episode) renders enough of it for the scroll position to be restored.
const revealed = new Map<string, number>();

/**
 * How many of `total` already-loaded items to render, growing by `page` as
 * The end of the list nears. `listKey` names the list: a new one starts from
 * The first page, one seen before resumes where it was.
 */
export const useRevealMore = (total: number, page: number, listKey: string) => {
  const [count, setCount] = useState(() => revealed.get(listKey) ?? page);
  const [key, setKey] = useState(listKey);

  // Switch lists during render rather than in an effect, so the first frame
  // Of the new list is already the right length.
  if (key !== listKey) {
    setKey(listKey);
    setCount(revealed.get(listKey) ?? page);
  }

  useEffect(() => {
    revealed.set(listKey, count);
  }, [listKey, count]);

  const sentinelRef = useSentinel({
    onReach: () => setCount((current) => Math.min(total, current + page)),
    enabled: count < total,
    generation: count,
  });

  return { count: Math.min(count, total), hasMore: count < total, sentinelRef };
};
