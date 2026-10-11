import { type RefObject, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useDebounced } from "@/lib/hooks";

const TYPING_SETTLE_MS = 150;

interface SearchFieldProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onEscape: () => void;
}

/**
 * The header's search box. The query lives in the URL (`?q=`) on whatever
 * Page is open, so results sit over that page instead of replacing it: the
 * Player keeps its iframe, home keeps its scroll, and Esc or Back returns to
 * Exactly where you were.
 */
export const SearchField = ({ inputRef, onEscape }: SearchFieldProps) => {
  const navigate = useNavigate();
  const query = useSearch({ strict: false, select: (search) => search.q ?? "" });
  const [value, setValue] = useState(query);
  const settled = useDebounced(value.trim(), TYPING_SETTLE_MS);

  // The last query this field wrote. A URL change that isn't ours (Back, a
  // Result click clearing it) is copied into the box; our own is not, so a
  // Slow navigation can never overwrite what is still being typed.
  const writtenRef = useRef(query);

  useEffect(() => {
    if (query !== writtenRef.current) {
      writtenRef.current = query;
      setValue(query);
    }
  }, [query]);

  useEffect(() => {
    if (settled === writtenRef.current) {
      return;
    }

    // The first keystroke gets its own history entry, so Back closes the
    // Results; refining the query after that replaces it.
    const replace = writtenRef.current !== "";

    writtenRef.current = settled;
    navigate({
      to: ".",
      search: (previous) => ({ ...previous, q: settled || undefined }),
      replace,
    });
  }, [settled, navigate]);

  const clear = () => {
    setValue("");
    writtenRef.current = "";
    navigate({ to: ".", search: (previous) => ({ ...previous, q: undefined }), replace: true });
  };

  return (
    <div className="relative flex h-10 min-w-0 flex-1 items-center border border-line bg-raised transition-colors duration-150 focus-within:border-line-strong">
      <Search aria-hidden className="pointer-events-none absolute left-[13px] size-4 text-muted" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder="Search every episode and moment"
        aria-label="Search every episode and moment"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        data-search-input
        className="h-full min-w-0 flex-1 bg-transparent pr-2 pl-10 text-[14px] outline-none placeholder:text-dim"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            clear();
            event.currentTarget.blur();
            onEscape();
          }
        }}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          className="grid h-full w-10 shrink-0 cursor-pointer place-items-center text-muted transition-colors duration-150 hover:text-ink"
          onClick={() => {
            clear();
            inputRef.current?.focus();
          }}
        >
          <X className="size-3.5 stroke-[1.75]" />
        </button>
      )}
    </div>
  );
};
