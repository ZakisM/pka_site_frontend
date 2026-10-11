import { ResultGroup, ResultGroupSkeleton } from "./ResultGroup";
import { type ResultSort, useGroupedResults } from "./useGroupedResults";
import { useCallback, useEffect, useRef, useState } from "react";
import { Ticks } from "@/ui/Loaders";
import { pluralise } from "@/lib/time";
import { railFilterIntentAtom } from "@/lib/intents";
import { searchTerms } from "@/ui/Highlight";
import { startIntentAtom } from "@/player/playerState";
import { useNavigate } from "@tanstack/react-router";
import { useRevealMore } from "@/lib/hooks";
import { useSetAtom } from "jotai";

const PAGE = 12;
const SKELETON_GROUPS = [0, 1, 2, 3];

const SORTS: { value: ResultSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "matches", label: "Most matches" },
];

/**
 * ↑/↓ walk the visible hits and Enter plays one, while focus stays in the
 * Search box. The selection is a DOM attribute rather than React state so a
 * Keypress never re-renders a list that may hold hundreds of rows.
 */
const useHitKeys = (containerRef: React.RefObject<HTMLDivElement | null>, resetKey: unknown) => {
  const selectedRef = useRef(-1);

  useEffect(() => {
    selectedRef.current = -1;
    containerRef.current?.querySelector("[aria-selected]")?.removeAttribute("aria-selected");
  }, [containerRef, resetKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const fromSearch = event.target instanceof HTMLElement && event.target.dataset.searchInput !== undefined;
      const hits = [...(containerRef.current?.querySelectorAll<HTMLElement>("[data-hit]") ?? [])];

      if (!fromSearch || hits.length === 0) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        hits[Math.max(0, selectedRef.current)]?.click();

        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      event.preventDefault();
      hits[selectedRef.current]?.removeAttribute("aria-selected");
      selectedRef.current = Math.min(
        hits.length - 1,
        Math.max(0, selectedRef.current + (event.key === "ArrowDown" ? 1 : -1)),
      );

      const hit = hits[selectedRef.current];

      hit?.setAttribute("aria-selected", "true");
      hit?.scrollIntoView({ block: "nearest" });
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [containerRef]);
};

/** Results for `?q=`, drawn over whatever page the search started from. */
export const SearchPage = ({ query }: { query: string }) => {
  const navigate = useNavigate();
  const setStartIntent = useSetAtom(startIntentAtom);
  const setFilterIntent = useSetAtom(railFilterIntentAtom);
  const [sort, setSort] = useState<ResultSort>("newest");
  const { groups, momentCount, updating, error } = useGroupedResults(query, sort);
  const { count, hasMore, sentinelRef } = useRevealMore(groups?.length ?? 0, PAGE, `${query}|${sort}`);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terms = searchTerms(query);

  useHitKeys(containerRef, `${query}|${sort}`);

  useEffect(() => {
    document.title = `${query} · PKA Index`;
  }, [query]);

  const open = useCallback(
    (episodeNumber: number) =>
      navigate({ to: "/watch/$episodeId", params: { episodeId: String(episodeNumber) }, search: {} }),
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

  if (error) {
    throw error;
  }

  return (
    <div ref={containerRef} className="mx-auto max-w-[1000px] px-6 pt-8 pb-18 mobile:px-4 mobile:pt-6 mobile:pb-14">
      {groups && groups.length === 0 ? (
        <p className="py-10 text-[14px]/[1.6] text-muted">
          Nothing matches “{query}”.
          <br />
          Try fewer words, or check the spelling of a name.
        </p>
      ) : (
        <>
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <p className="flex items-center gap-3 text-[14px] tabular-nums text-muted">
              {groups ? (
                <span>
                  <b className="font-medium text-ink">{pluralise(momentCount, "moment")}</b> in{" "}
                  <b className="font-medium text-ink">{pluralise(groups.length, "episode")}</b>
                </span>
              ) : (
                <span>Searching…</span>
              )}
              {(updating || !groups) && <Ticks size="sm" tone="muted" label="Updating results" />}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-dim mobile:hidden">
                ↑ ↓ to move · Enter to play · Esc to go back
              </span>
              <div role="group" aria-label="Sort results" className="flex border border-line">
                {SORTS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={sort === option.value}
                    className="cursor-pointer border-line px-3 py-1.5 text-[12px] text-muted transition-colors duration-150 not-first:border-l hover:text-ink aria-pressed:bg-hover aria-pressed:text-ink"
                    onClick={() => setSort(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={updating ? "opacity-60 transition-opacity duration-150" : "transition-opacity duration-150"}>
            {groups
              ? groups.slice(0, count).map((group) => (
                  <ResultGroup
                    key={group.episode.episodeNumber}
                    group={group}
                    terms={terms}
                    onPlay={play}
                    onMore={more}
                  />
                ))
              : SKELETON_GROUPS.map((key) => <ResultGroupSkeleton key={key} />)}
          </div>
          {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}
        </>
      )}
    </div>
  );
};
