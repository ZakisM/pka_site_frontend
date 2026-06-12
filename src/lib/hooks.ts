import { useEffect, useState } from "react";

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
