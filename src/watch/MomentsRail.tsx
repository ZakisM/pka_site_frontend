import { Search, X } from "lucide-react";
import { formatDuration, formatTimestamp } from "@/lib/time";
import { isSpent, spend } from "@/lib/intents";
import { matchesTerms, searchTerms } from "@/lib/searchTerms";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useRouter } from "@tanstack/react-router";
import { Highlight } from "@/ui/Highlight";
import type { PkaEvent } from "@/lib/api";
import { player } from "@/player/controller";
import { smoothScroll } from "@/lib/motion";

interface MomentRowProps {
  event: PkaEvent;
  index: number;
  active: boolean;
  // Seconds left in this moment; only set on the active row, so other rows
  // Never re-render on playback ticks.
  remaining: number | undefined;
  terms: string[];
  onSeek: (seconds: number) => void;
}

const MomentRow = ({ event, index, active, remaining, terms, onSeek }: MomentRowProps) => (
  <button
    type="button"
    data-index={index}
    data-active={active ? true : undefined}
    className="group relative grid w-full cursor-pointer grid-cols-[56px_1fr_auto] items-baseline gap-3 px-5 py-2.5 text-left text-[14px]/[1.4] text-secondary transition-colors duration-100 hover:bg-raised hover:text-ink data-active:bg-raised data-active:text-ink mobile:px-4"
    onClick={() => onSeek(event.timestamp)}
  >
    {active && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}
    <time className="text-[13px] tabular-nums text-muted group-data-active:font-medium group-data-active:text-primary">
      {formatTimestamp(event.timestamp)}
    </time>
    <span className="min-w-0 text-pretty">
      <Highlight text={event.description} terms={terms} />
    </span>
    <span className="text-[11px] tabular-nums text-dim group-data-active:text-secondary">
      {remaining === undefined ? formatDuration(event.lengthSeconds) : `${formatDuration(remaining)} left`}
    </span>
  </button>
);

/**
 * Keeps the playing moment a third of the way down the list, gliding one row
 * At a time during playback and snapping for anything further. Only when the
 * List scrolls on its own: on phones it is part of the page, and moving the
 * Page under someone's thumb would be worse than not following.
 */
const scrollToRow = (list: HTMLElement, index: number, behavior: ScrollBehavior) => {
  const row = list.querySelector<HTMLElement>(`[data-index="${index}"]`);

  if (row && !list.matches(":hover") && list.scrollHeight > list.clientHeight + 1) {
    list.scrollTo({ top: row.offsetTop - list.clientHeight / 3, behavior });
  }

  return row !== null;
};

/**
 * Keeps the router's scroll restoration off the list. The router restores
 * The scroll of every element that has scrolled, and carries one over to the
 * Next page when that page has an element in the same place — which the next
 * Episode's list is. Its restore lands after this hook has placed the playing
 * Moment, and put the list back at the last episode's offset. It runs before
 * Any listener added here, so this puts the list back where it was left.
 */
const useOwnScroll = (listRef: React.RefObject<HTMLDivElement | null>) => {
  const router = useRouter();
  const ownTopRef = useRef(0);

  useLayoutEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    ownTopRef.current = list.scrollTop;

    const record = () => {
      ownTopRef.current = list.scrollTop;
    };
    const unsubscribe = router.subscribe("onRendered", () => {
      if (list.scrollTop !== ownTopRef.current) {
        list.scrollTop = ownTopRef.current;
      }
    });

    list.addEventListener("scroll", record, { passive: true });

    return () => {
      unsubscribe();
      list.removeEventListener("scroll", record);
    };
  }, [listRef, router]);

  // Scroll events arrive a frame late; a scroll made here is recorded now, so
  // A restore in between can't win. Stable, so effects using it run only when
  // Their own inputs change.
  return useCallback((list: HTMLElement) => {
    ownTopRef.current = list.scrollTop;
  }, []);
};

const useFollowActive = (listRef: React.RefObject<HTMLDivElement | null>, activeIndex: number, filter: string) => {
  const previousRef = useRef<number | null>(null);
  const activeRef = useRef(activeIndex);
  const recordOwn = useOwnScroll(listRef);

  useLayoutEffect(() => {
    const list = listRef.current;
    const previous = previousRef.current;

    activeRef.current = activeIndex;

    previousRef.current = activeIndex;

    if (list && previous !== activeIndex) {
      const adjacent = previous !== null && Math.abs(activeIndex - previous) === 1;

      scrollToRow(list, activeIndex, adjacent ? smoothScroll() : "instant");
      recordOwn(list);
    }
  }, [listRef, activeIndex, recordOwn]);

  // Changing the filter changes which rows exist: bring the playing moment
  // Back into view (clearing the filter should not strand the list wherever
  // The filtered rows left it), or start from the top if it was filtered out.
  const filterRef = useRef(filter);

  useLayoutEffect(() => {
    const list = listRef.current;

    if (!list || filterRef.current === filter) {
      return;
    }

    filterRef.current = filter;

    if (!scrollToRow(list, activeRef.current, "instant")) {
      list.scrollTop = 0;
    }

    recordOwn(list);
  }, [listRef, filter, recordOwn]);

  // A resize (or the layout switching between beside and below the video)
  // Changes the list's height; put the playing moment back in its place.
  useLayoutEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const observer = new ResizeObserver(() => {
      scrollToRow(list, activeRef.current, "instant");
      recordOwn(list);
    });

    observer.observe(list);

    return () => observer.disconnect();
  }, [listRef, recordOwn]);
};

interface MomentsRailProps {
  events: PkaEvent[];
  episodeNumber: number;
  activeIndex: number;
  position: number;
}

/** The episode's moments, filterable; every row is a play target. */
export const MomentsRail = ({ events, episodeNumber, activeIndex, position }: MomentsRailProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  // A search's "more moments in this episode" applies its query here, once
  // (see lib/intents): on the first render when it opens a new episode, so
  // The full list never flashes, and whenever it arrives for the episode
  // Already on screen.
  const intent = useLocation({ select: (location) => location.state.filterMoments });
  const wanted = intent?.episodeNumber === episodeNumber && !isSpent(intent.id) ? intent : undefined;
  const [filter, setFilter] = useState(() => wanted?.filter ?? "");
  const [appliedId, setAppliedId] = useState(wanted?.id);

  if (wanted && wanted.id !== appliedId) {
    setAppliedId(wanted.id);
    setFilter(wanted.filter);
  }

  useEffect(() => {
    if (wanted) {
      spend(wanted.id);
    }
  }, [wanted]);

  useFollowActive(listRef, activeIndex, filter);

  const terms = searchTerms(filter);
  const rows = events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => matchesTerms(event.description, terms));

  return (
    // Keyed per episode by its parent, so a new episode's moments fade in.
    <aside className="flex animate-fade-in flex-col desktop:sticky desktop:top-(--header-h) desktop:row-span-2 desktop:h-[calc(100dvh-var(--header-h))] desktop:self-start desktop:border-l desktop:border-line mobile:mt-6">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 mobile:px-4">
          <h2 className="text-[15px] font-semibold">Moments</h2>
          <span className="text-[12px] tabular-nums text-dim">{events.length > 0 ? events.length : ""}</span>
          {events.length > 0 && (
            <div className="relative ml-auto flex h-8 w-44 items-center border border-line bg-raised transition-colors duration-150 focus-within:border-line-strong">
              <Search aria-hidden className="pointer-events-none absolute left-2.5 size-3.5 text-dim" />
              <input
                type="text"
                value={filter}
                placeholder="Filter"
                aria-label="Filter moments"
                autoComplete="off"
                spellCheck={false}
                className="h-full min-w-0 flex-1 bg-transparent pr-2 pl-8 text-[13px] outline-none placeholder:text-dim"
                onChange={(event) => setFilter(event.target.value)}
              />
              {filter && (
                <button
                  type="button"
                  aria-label="Clear filter"
                  className="grid h-full w-8 shrink-0 cursor-pointer place-items-center text-muted hover:text-ink"
                  onClick={() => setFilter("")}
                >
                  <X className="size-3 stroke-[1.75]" />
                </button>
              )}
            </div>
          )}
        </div>
        <div
          ref={listRef}
          className="relative min-h-0 flex-1 border-t border-line py-2 [scrollbar-color:var(--color-line-strong)_transparent] [scrollbar-width:thin] desktop:overflow-y-auto mobile:max-h-[60dvh] mobile:overflow-y-auto"
        >
          {events.length === 0 && (
            <p className="px-5 py-6 text-[14px]/[1.5] text-dim">Nobody has timestamped this episode yet.</p>
          )}
          {events.length > 0 && rows.length === 0 && (
            <p className="px-5 py-6 text-[14px]/[1.5] text-dim">No moments in this episode mention “{filter}”.</p>
          )}
          {rows.map(({ event, index }) => {
            const active = index === activeIndex;

            return (
              <MomentRow
                key={event.timestamp}
                event={event}
                index={index}
                active={active}
                remaining={active ? Math.max(0, event.timestamp + event.lengthSeconds - position) : undefined}
                terms={terms}
                onSeek={player.seek}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
};
