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
export const useSentinel = (onReach: () => void, enabled: boolean, generation: number) => {
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
      { rootMargin: "1200px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onReach, enabled, generation]);

  return sentinelRef;
};

/**
 * How many of `total` already-loaded items to render, growing by `page` as
 * The end of the list nears and resetting when `resetKey` changes.
 */
export const useRevealMore = (total: number, page: number, resetKey: unknown) => {
  const [count, setCount] = useState(page);
  const [key, setKey] = useState(resetKey);

  // Reset during render rather than in an effect, so the first frame of a new
  // List is already the right length.
  if (key !== resetKey) {
    setKey(resetKey);
    setCount(page);
  }

  const sentinelRef = useSentinel(
    () => setCount((current) => Math.min(total, current + page)),
    count < total,
    count,
  );

  return { count: Math.min(count, total), hasMore: count < total, sentinelRef };
};
