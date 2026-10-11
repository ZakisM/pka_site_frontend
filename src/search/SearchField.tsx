import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { resultsScroll, useCloseSearch } from "./searchState";
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
 * Player keeps its iframe and the page keeps its place.
 *
 * The text stays in the box after a result is opened, like any search bar;
 * Focusing the box (or Enter) brings those results back where they were left.
 * Only clearing empties it.
 */
export const SearchField = ({ inputRef, onEscape }: SearchFieldProps) => {
  const navigate = useNavigate();
  const closeSearch = useCloseSearch();
  const query = useSearch({ strict: false, select: (search) => search.q ?? "" });
  const [value, setValue] = useState(query);
  const settled = useDebounced(value.trim(), TYPING_SETTLE_MS);

  // The last query this field wrote. A different query arriving from the URL
  // (Back or Forward between searches) is copied into the box; our own is
  // Not, so a slow navigation never overwrites what is still being typed.
  const writtenRef = useRef(query);

  useEffect(() => {
    if (query !== writtenRef.current) {
      writtenRef.current = query;

      if (query) {
        setValue(query);
      }
    }
  }, [query]);

  const showResults = useCallback(
    (term: string) => {
      // The first query over a page gets its own history entry, so Back (or
      // Esc) returns to that page; refining the query replaces it.
      const opening = writtenRef.current === "";

      writtenRef.current = term;
      navigate({
        to: ".",
        search: (previous) => ({ ...previous, q: term }),
        replace: !opening,
        // The results are a layer over the page: leave the page where it is.
        resetScroll: false,
        state: (previous) => ({ ...previous, searchOverlay: opening || previous.searchOverlay }),
      });
    },
    [navigate],
  );

  const focusingClickRef = useRef(false);

  // Typing searches as it settles. Only a change to the text does: the box
  // Keeping its text after a result is opened must not reopen the results.
  const typedRef = useRef(false);

  useEffect(() => {
    if (!typedRef.current || settled === writtenRef.current) {
      return;
    }

    typedRef.current = false;

    if (settled) {
      // A new search starts at the top, even for a query searched before.
      resultsScroll.delete(settled);
      showResults(settled);
    } else {
      writtenRef.current = "";
      closeSearch();
    }
  }, [settled, showResults, closeSearch]);

  const clear = () => {
    typedRef.current = false;
    setValue("");

    if (writtenRef.current) {
      writtenRef.current = "";
      closeSearch();
    }
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
        onChange={(event) => {
          typedRef.current = true;
          setValue(event.target.value);
        }}
        // Focusing selects the kept query so typing replaces it. The mouseup
        // Of the click that focused the box would collapse that selection to
        // A caret, so that one mouseup is cancelled.
        onFocus={(event) => event.currentTarget.select()}
        // Clicking back into a kept query brings its results back as they
        // Were. On click, not focus: returning to the browser window re-fires
        // Focus on the box and would cover the video with old results.
        onClick={() => {
          if (value.trim() && !query) {
            showResults(value.trim());
          }
        }}
        onMouseDown={(event) => {
          focusingClickRef.current = document.activeElement !== event.currentTarget;
        }}
        onMouseUp={(event) => {
          if (focusingClickRef.current) {
            focusingClickRef.current = false;
            event.preventDefault();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && value.trim() && !query) {
            // Handled: the results this opens must not also read this Enter
            // As "play the first hit".
            event.preventDefault();
            showResults(value.trim());

            return;
          }

          // Esc closes the results like their Close button does, keeping
          // The query in the box to come back to; the × is what clears it.
          if (event.key === "Escape") {
            event.preventDefault();
            // A search still settling must not reopen what Esc just closed.
            typedRef.current = false;

            if (query) {
              closeSearch();
            }

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
