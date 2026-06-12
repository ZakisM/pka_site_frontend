import { SearchResults, SearchResultsSkeleton } from "./SearchResults";
import {
  type SearchRow,
  type SearchTab,
  searchOpenAtom,
  searchQueryAtom,
  searchTabAtom,
  selectedIndexAtom,
} from "./searchState";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { useDebounced, useMediaQuery } from "@/lib/hooks";
import { Search } from "lucide-react";
import { SearchEmpty } from "./SearchEmpty";
import { SearchPreview } from "./SearchPreview";
import { SearchTabs } from "./SearchTabs";
import { Ticks } from "@/ui/Loaders";
import type { VListHandle } from "virtua";
import { useIsFetching } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useSearchActions } from "./useSearchActions";
import { useSearchKeys } from "./useSearchKeys";
import { useSearchResults } from "./useSearchResults";

const TYPING_SETTLE_MS = 250;
// The 440px preview only earns its space at a real desktop width.
const PREVIEW_FROM = "(min-width: 1180px)";

const chipStyles =
  "border border-control px-[5px] py-px text-[11px] tabular-nums text-dimmer";

// The row's href keeps ?timestamp so cmd-click and copy-link still share the
// Moment, even though a plain click navigates to a clean URL.
const rowLocation = (row: SearchRow) => ({
  to: "/watch/$episodeId" as const,
  params: { episodeId: String(row.episodeNumber) },
  search: row.timestamp === undefined ? {} : { timestamp: row.timestamp },
});

export const SearchScreen = () => {
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useAtom(searchOpenAtom);
  const [query, setQuery] = useAtom(searchQueryAtom);
  const [tab, setTab] = useAtom(searchTabAtom);
  const setSelectedIndex = useSetAtom(selectedIndexAtom);

  const showPreview = useMediaQuery(PREVIEW_FROM);
  const fetching = useIsFetching({ queryKey: ["search"] }) > 0;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<VListHandle | null>(null);

  const debouncedQuery = useDebounced(query, TYPING_SETTLE_MS);
  const { rows, momentCount, episodeCount, loaded } = useSearchResults(
    tab,
    debouncedQuery,
  );
  const { playRow, playMoment, randomMoment } = useSearchActions();

  useSearchKeys({ rows, listRef, onPlay: playRow });

  useEffect(() => {
    if (searchOpen) {
      // PreventScroll stops mobile browsers panning the page when the virtual
      // Keyboard opens; the input is already at the top of the takeover.
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [searchOpen]);

  // A new term or tab invalidates the old selection and scroll offset — but
  // Only an actual change does. <Activity> re-runs effects every time the
  // Takeover is revealed, which would otherwise jump the list back to the top
  // Each time it is reopened.
  const listKey = `${tab}:${debouncedQuery}`;
  const lastListKeyRef = useRef(listKey);

  useEffect(() => {
    if (lastListKeyRef.current === listKey) {
      return;
    }

    lastListKeyRef.current = listKey;
    setSelectedIndex(0);
    listRef.current?.scrollTo(0);
  }, [listKey, setSelectedIndex]);

  const clearSearch = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, [setQuery]);

  const buildHref = useCallback(
    (row: SearchRow) => router.buildLocation(rowLocation(row)).href,
    [router],
  );

  const selectTab = useCallback((next: SearchTab) => setTab(next), [setTab]);

  let results = <SearchResultsSkeleton />;

  if (loaded && rows.length === 0) {
    results = (
      <SearchEmpty
        query={debouncedQuery}
        onClear={clearSearch}
        onRandomMoment={randomMoment}
      />
    );
  } else if (loaded) {
    results = (
      <SearchResults
        key={tab}
        rows={rows}
        listRef={listRef}
        scrollKey={listKey}
        buildHref={buildHref}
        onPlay={playRow}
      />
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col desktop:border-r desktop:border-hairline">
        <div className="flex h-[57px] shrink-0 items-center gap-3 border-b border-hairline px-3.5 desktop:h-[67px] desktop:gap-3.5 desktop:px-[26px]">
          {fetching ? (
            <Ticks className="w-[18px] shrink-0 justify-center desktop:w-5" />
          ) : (
            <Search
              aria-hidden
              className="size-[18px] shrink-0 stroke-[2.3] text-primary desktop:size-5"
            />
          )}
          <input
            ref={inputRef}
            className="min-w-0 flex-1 bg-transparent px-0.5 py-px font-raleway text-[18px] font-bold text-ink caret-primary outline-none placeholder:text-faint desktop:text-[23px] desktop:tracking-[-0.01em]"
            placeholder="Search every episode and moment"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            className="flex shrink-0 cursor-pointer items-center gap-2 border border-control px-2.5 py-1.5 text-[13px] text-muted transition-colors duration-150 hover:bg-row-hover hover:text-ink"
            onClick={() => setSearchOpen(false)}
          >
            Close
            <span className={`${chipStyles} mobile:hidden`}>esc</span>
          </button>
        </div>

        <SearchTabs
          tab={tab}
          counts={{ moments: momentCount, episodes: episodeCount }}
          onSelect={selectTab}
        />

        {results}

        <div className="flex h-[41px] shrink-0 items-center gap-[22px] border-t border-hairline px-4 text-[11px] text-dimmer desktop:h-[45px] desktop:px-[26px]">
          <span className="mobile:hidden">↑↓ move</span>
          <span className="mobile:hidden">↵ play from timestamp</span>
          <span className="mobile:hidden">⇧↵ open episode</span>
          <span className="desktop:hidden">
            {tab === "moments"
              ? "Tap a moment to play from there"
              : "Tap an episode to open it"}
          </span>
        </div>
      </div>

      {showPreview && (
        <SearchPreview
          rows={rows}
          showMatch={tab === "moments"}
          onPlay={playMoment}
        />
      )}
    </div>
  );
};
