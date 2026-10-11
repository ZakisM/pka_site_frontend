import { Highlight, searchTerms } from "@/ui/Highlight";
import { Search, X } from "lucide-react";
import { formatDuration, formatTimestamp } from "@/lib/time";
import { useAtom, useSetAtom } from "jotai";
import { useLayoutEffect, useRef, useState } from "react";
import type { PkaEvent } from "@/lib/api";
import { railFilterIntentAtom } from "@/lib/intents";
import { seekRequestAtom } from "@/player/playerState";

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
};

const useFollowActive = (listRef: React.RefObject<HTMLDivElement | null>, activeIndex: number) => {
  const previousRef = useRef<number | null>(null);
  const activeRef = useRef(activeIndex);

  useLayoutEffect(() => {
    const list = listRef.current;
    const previous = previousRef.current;

    activeRef.current = activeIndex;

    previousRef.current = activeIndex;

    if (list && previous !== activeIndex) {
      const adjacent = previous !== null && Math.abs(activeIndex - previous) === 1;

      scrollToRow(list, activeIndex, adjacent ? "smooth" : "instant");
    }
  }, [listRef, activeIndex]);

  // A resize (or the layout switching between beside and below the video)
  // Changes the list's height; put the playing moment back in its place.
  useLayoutEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const observer = new ResizeObserver(() => scrollToRow(list, activeRef.current, "instant"));

    observer.observe(list);

    return () => observer.disconnect();
  }, [listRef]);
};

interface MomentsRailProps {
  events: PkaEvent[];
  episodeNumber: number;
  activeIndex: number;
  position: number;
}

/** The episode's moments, filterable; every row is a play target. */
export const MomentsRail = ({ events, episodeNumber, activeIndex, position }: MomentsRailProps) => {
  const setSeekRequest = useSetAtom(seekRequestAtom);
  const [filterIntent, setFilterIntent] = useAtom(railFilterIntentAtom);
  const listRef = useRef<HTMLDivElement | null>(null);

  // A search's "more moments in this episode" opens with its query applied.
  // The rail is keyed per episode, so this runs once for each.
  const [filter, setFilter] = useState(() =>
    filterIntent?.episodeNumber === episodeNumber ? filterIntent.filter : "",
  );

  useLayoutEffect(() => {
    if (filterIntent) {
      setFilterIntent(null);
    }
    // eslint-disable-next-line exhaustive-deps
  }, []);

  useFollowActive(listRef, activeIndex);

  const terms = searchTerms(filter);
  const rows = events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => terms.every((term) => event.description.toLowerCase().includes(term)));

  const seek = (seconds: number) => setSeekRequest({ seconds, requestedAt: Date.now() });

  return (
    <aside className="flex flex-col desktop:sticky desktop:top-(--header-h) desktop:row-span-2 desktop:h-[calc(100dvh-var(--header-h))] desktop:self-start desktop:border-l desktop:border-line mobile:mt-6">
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
              onSeek={seek}
            />
          );
        })}
      </div>
      </div>
    </aside>
  );
};
