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
 * How many of `total` items to render. Grows by `page` whenever the sentinel
 * Comes within a screen or so of view, and resets when `resetKey` changes.
 * The observer is rebuilt after each page, which makes it report again if the
 * Sentinel is still in range — so a tall screen keeps filling itself.
 */
export const useRevealMore = (total: number, page: number, resetKey: unknown) => {
  const [count, setCount] = useState(page);
  const [key, setKey] = useState(resetKey);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset during render rather than in an effect, so the first frame of a new
  // List is already the right length.
  if (key !== resetKey) {
    setKey(resetKey);
    setCount(page);
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || count >= total) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setCount((current) => Math.min(total, current + page));
        }
      },
      { rootMargin: "1200px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [count, total, page]);

  return { count: Math.min(count, total), hasMore: count < total, sentinelRef };
};
