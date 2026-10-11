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
  // Fraction (0–1) through this moment; only meaningful when active, so
  // Inactive rows never re-render on playback ticks.
  progress: number;
  terms: string[];
  onSeek: (seconds: number) => void;
}

const MomentRow = ({ event, index, active, progress, terms, onSeek }: MomentRowProps) => (
  <button
    type="button"
    data-index={index}
    data-active={active ? true : undefined}
    className="group relative grid w-full cursor-pointer grid-cols-[52px_1fr] gap-3 px-5 py-2.5 text-left text-[14px]/[1.4] text-secondary transition-colors duration-100 hover:bg-raised hover:text-ink data-active:bg-raised data-active:text-ink mobile:px-4"
    onClick={() => onSeek(event.timestamp)}
  >
    {active && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}
    <span className="flex flex-col gap-[3px] pt-px tabular-nums">
      <time className="text-[13px] text-muted group-data-active:font-medium group-data-active:text-primary">
        {formatTimestamp(event.timestamp)}
      </time>
      <span className="text-[11px] text-dim">{formatDuration(event.lengthSeconds)}</span>
    </span>
    <span className="min-w-0 text-pretty">
      <Highlight text={event.description} terms={terms} />
    </span>
    {active && (
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 bg-primary/70"
        style={{ width: `${(progress * 100).toFixed(1)}%` }}
      />
    )}
  </button>
);

/**
 * Keeps the playing moment a third of the way down the list, gliding one row
 * At a time during playback and snapping for anything further. Only when the
 * List scrolls on its own: on phones it is part of the page, and moving the
 * Page under someone's thumb would be worse than not following.
 */
const useFollowActive = (listRef: React.RefObject<HTMLDivElement | null>, activeIndex: number) => {
  const previousRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    const previous = previousRef.current;

    previousRef.current = activeIndex;

    if (!list || !row || previous === activeIndex || list.matches(":hover")) {
      return;
    }

    if (list.scrollHeight <= list.clientHeight + 1) {
      return;
    }

    list.scrollTo({
      top: row.offsetTop - list.clientHeight / 3,
      behavior: previous !== null && Math.abs(activeIndex - previous) === 1 ? "smooth" : "instant",
    });
  }, [listRef, activeIndex]);
};

interface MomentsRailProps {
  events: PkaEvent[];
  episodeNumber: number;
  activeIndex: number;
  position: number;
}

/** The episode's moments: every row is a play target, and they can be filtered. */
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
    <aside className="flex flex-col desktop:sticky desktop:top-(--header-h) desktop:h-[calc(100dvh-var(--header-h))] desktop:border-l desktop:border-line mobile:mt-4 mobile:border-t mobile:border-line">
      <div className="flex flex-col gap-3 px-5 pt-5 pb-3.5 mobile:px-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold">Moments</h2>
          <span className="text-[12px] tabular-nums text-dim">{events.length > 0 ? events.length : ""}</span>
        </div>
        {events.length > 0 && (
          <div className="relative flex h-[34px] items-center border border-line bg-raised transition-colors duration-150 focus-within:border-line-strong">
            <Search aria-hidden className="pointer-events-none absolute left-2.5 size-3.5 text-dim" />
            <input
              type="text"
              value={filter}
              placeholder="Filter moments"
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
                className="grid h-full w-[34px] shrink-0 cursor-pointer place-items-center text-muted hover:text-ink"
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
        className="border-t border-line py-2 desktop:min-h-0 desktop:flex-1 desktop:overflow-y-auto desktop:[mask-image:linear-gradient(transparent,#000_16px,#000_calc(100%-24px),transparent)] desktop:[scrollbar-color:var(--color-line-strong)_transparent] desktop:[scrollbar-width:thin]"
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
              progress={active ? Math.min(1, Math.max(0, (position - event.timestamp) / Math.max(event.lengthSeconds, 1))) : 0}
              terms={terms}
              onSeek={seek}
            />
          );
        })}
      </div>
    </aside>
  );
};
