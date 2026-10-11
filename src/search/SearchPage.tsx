import { ResultGroup, ResultGroupSkeleton } from "./ResultGroup";
import { searchSortAtom, useCloseSearch } from "./searchState";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import type { SearchSort } from "@/lib/api";
import { Ticks } from "@/ui/Loaders";
import { X } from "lucide-react";
import { pluralise } from "@/lib/time";
import { railFilterIntentAtom } from "@/lib/intents";
import { searchQuery } from "@/lib/queries";
import { searchTerms } from "@/ui/Highlight";
import { startIntentAtom } from "@/player/playerState";
import { useHitKeys } from "./useHitKeys";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSentinel } from "@/lib/hooks";

const SKELETON_GROUPS = [0, 1, 2, 3];

const SORTS: { value: SearchSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "matches", label: "Most matches" },
];

// Same page edges as the header; wide screens get two columns of results.
const pageStyles = "px-6 pt-8 pb-18 mobile:px-4 mobile:pt-6 mobile:pb-14";
const groupsStyles =
  "grid grid-cols-[repeat(auto-fill,minmax(min(100%,640px),1fr))] gap-x-12 transition-opacity duration-150";

// Phones close from the header's Cancel; desktops get this beside the sort.
const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button
    type="button"
    title="Close search (Esc)"
    className="flex cursor-pointer items-center gap-1.5 border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors duration-150 hover:border-line-strong hover:text-ink mobile:hidden"
    onClick={onClose}
  >
    <X aria-hidden className="size-3.5 stroke-[1.75]" />
    Close
  </button>
);

interface ResultsToolbarProps {
  totals: { totalMoments: number; totalEpisodes: number } | undefined;
  updating: boolean;
  sort: SearchSort;
  onSort: (sort: SearchSort) => void;
  onClose: () => void;
}

const ResultsToolbar = ({ totals, updating, sort, onSort, onClose }: ResultsToolbarProps) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
    <p className="flex items-center gap-3 text-[14px] tabular-nums text-muted">
      {totals ? (
        <span>
          <b className="font-medium text-ink">{pluralise(totals.totalMoments, "moment")}</b> in{" "}
          <b className="font-medium text-ink">{pluralise(totals.totalEpisodes, "episode")}</b>
        </span>
      ) : (
        <span>Searching…</span>
      )}
      {updating && <Ticks size="sm" tone="muted" label="Updating results" />}
    </p>
    <div className="flex items-center gap-4">
      <span className="text-[12px] text-dim mobile:hidden">↑ ↓ to move · Enter to play</span>
      <div role="group" aria-label="Sort results" className="flex border border-line">
        {SORTS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={sort === option.value}
            className="cursor-pointer border-line px-3 py-1.5 text-[12px] text-muted transition-colors duration-150 not-first:border-l hover:text-ink aria-pressed:bg-hover aria-pressed:text-ink"
            onClick={() => onSort(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <CloseButton onClose={onClose} />
    </div>
  </div>
);

interface QueryOutcome {
  isError: boolean;
  isFetchNextPageError: boolean;
  hasData: boolean;
  isPlaceholderData: boolean;
}

// The first page failed — including when the rows on screen are the previous
// Query's placeholder, which would otherwise sit under the new query with a
// Spinner that never stops. A failed later page is shown at the list's end.
const searchFailed = ({ isError, isFetchNextPageError, hasData, isPlaceholderData }: QueryOutcome) =>
  isError && !isFetchNextPageError && (!hasData || isPlaceholderData);

const SearchUnavailable = ({ retrying, onRetry }: { retrying: boolean; onRetry: () => void }) => (
  <div className={pageStyles}>
    <p className="py-10 text-[14px]/[1.6] text-muted">
      Search isn't responding right now.
      <br />
      <button
        type="button"
        disabled={retrying}
        className="mt-3 cursor-pointer border border-line px-3.5 py-2 text-[13px] text-secondary transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-ink disabled:opacity-50"
        onClick={onRetry}
      >
        Try again
      </button>
    </p>
  </div>
);

const LoadMoreFailed = ({ onRetry }: { onRetry: () => void }) => (
  <p className="py-6 text-[13px] text-muted">
    Couldn't load more results.{" "}
    <button
      type="button"
      className="cursor-pointer text-secondary underline decoration-line-strong underline-offset-3 hover:text-ink"
      onClick={onRetry}
    >
      Try again
    </button>
  </p>
);

/** Results for `?q=`, drawn over whatever page the search started from. */
interface SearchPageProps {
  query: string;
  scrollRoot: React.RefObject<HTMLElement | null>;
}

export const SearchPage = ({ query, scrollRoot }: SearchPageProps) => {
  const navigate = useNavigate();
  const setStartIntent = useSetAtom(startIntentAtom);
  const setFilterIntent = useSetAtom(railFilterIntentAtom);
  const [sort, setSort] = useAtom(searchSortAtom);
  const {
    data,
    isError,
    isFetchNextPageError,
    isPlaceholderData,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(searchQuery(query, sort));
  const groups = data?.pages.flatMap((page) => page.groups);
  const totals = data?.pages[0];
  const sentinelRef = useSentinel({
    onReach: useCallback(() => {
      fetchNextPage();
    }, [fetchNextPage]),
    enabled: hasNextPage && !isFetchingNextPage && !isPlaceholderData,
    generation: data?.pages.length ?? 0,
    scrollRoot,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terms = searchTerms(query);

  useHitKeys({ containerRef, resetKey: `${query}|${sort}`, query, current: !isPlaceholderData });

  // Esc closes the results from anywhere on them, not only from the search
  // Box (which handles its own Esc, and marks it handled).
  const closeSearch = useCloseSearch();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        closeSearch();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeSearch]);

  useEffect(() => {
    document.title = `${query} · PKA Index`;
  }, [query]);

  const open = useCallback(
    (episodeNumber: number) => {
      // Out of the search box: on phones this puts the keyboard away, and a
      // Focused box would otherwise sit over the episode now playing.
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      navigate({ to: "/watch/$episodeId", params: { episodeId: String(episodeNumber) }, search: {} });
    },
    [navigate],
  );

  const play = useCallback(
    (episodeNumber: number, seconds: number) => {
      setStartIntent({ episodeNumber, seconds, requestedAt: Date.now() });
      open(episodeNumber);
    },
    [open, setStartIntent],
  );

  const more = useCallback(
    (episodeNumber: number) => {
      setFilterIntent({ episodeNumber, filter: query });
      open(episodeNumber);
    },
    [open, query, setFilterIntent],
  );

  // Shown in place, never thrown: an error boundary above this would take the
  // Header and the page underneath (and its player) down with it.
  if (searchFailed({ isError, isFetchNextPageError, hasData: data !== undefined, isPlaceholderData })) {
    return <SearchUnavailable retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <div ref={containerRef} className={pageStyles}>
      {groups && groups.length === 0 && !isPlaceholderData ? (
        <div className="flex items-start justify-between gap-4">
          <p className="py-10 text-[14px]/[1.6] text-muted">
            Nothing matches “{query}”.
            <br />
            Try fewer words, or check the spelling of a name.
          </p>
          <CloseButton onClose={closeSearch} />
        </div>
      ) : (
        <>
          <ResultsToolbar
            totals={totals}
            updating={isPlaceholderData || !totals}
            sort={sort}
            onSort={setSort}
            onClose={closeSearch}
          />
          <div className={isPlaceholderData ? `${groupsStyles} opacity-60` : groupsStyles}>
            {groups
              ? groups.map((group) => (
                  <ResultGroup
                    key={group.episode.episodeNumber}
                    group={group}
                    terms={terms}
                    onPlay={play}
                    onMore={more}
                  />
                ))
              : SKELETON_GROUPS.map((key) => <ResultGroupSkeleton key={key} />)}
            {isFetchingNextPage && <ResultGroupSkeleton />}
          </div>
          {hasNextPage && !isFetchNextPageError && <div ref={sentinelRef} aria-hidden className="h-px" />}
          {isFetchNextPageError && <LoadMoreFailed onRetry={() => fetchNextPage()} />}
        </>
      )}
    </div>
  );
};
