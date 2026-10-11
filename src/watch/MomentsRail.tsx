import { Highlight, searchTerms } from "@/ui/Highlight";
import { Search, X } from "lucide-react";
import { formatDuration, formatTimestamp } from "@/lib/time";
import { useAtom, useSetAtom } from "jotai";
import { useLayoutEffect, useRef, useState } from "react";
import type { PkaEvent } from "@/lib/api";
import { railFilterIntentAtom } from "@/lib/intents";
import { seekRequestAtom } from "@/player/playerState";

const SECONDS_PER_HOUR = 3600;

interface NowPlayingProps {
  event: PkaEvent;
  next: PkaEvent | undefined;
  position: number;
  onSeek: (seconds: number) => void;
}

/** Where you are, without scanning the list: the current moment and the next. */
const NowPlaying = ({ event, next, position, onSeek }: NowPlayingProps) => {
  const elapsed = Math.max(0, position - event.timestamp);
  const progress = Math.min(1, elapsed / Math.max(event.lengthSeconds, 1));

  return (
    <section className="border-b border-line px-5 pt-5 pb-4 mobile:px-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">Now playing</h2>
        <time className="text-[12px] tabular-nums text-muted">{formatTimestamp(event.timestamp)}</time>
      </div>
      <p className="mt-2 line-clamp-3 text-[16px]/[1.35] font-medium text-pretty">{event.description}</p>
      <div className="mt-3 flex items-center gap-3">
        <span aria-hidden className="h-0.5 flex-1 bg-line">
          <span className="block h-full bg-primary" style={{ width: `${(progress * 100).toFixed(1)}%` }} />
        </span>
        <span className="text-[12px] tabular-nums text-muted">
          {formatDuration(Math.max(0, event.lengthSeconds - elapsed))} left
        </span>
      </div>
      {next && (
        <button
          type="button"
          className="mt-3 flex w-full cursor-pointer items-baseline gap-2.5 text-left text-[13px] text-secondary transition-colors duration-150 hover:text-ink"
          onClick={() => onSeek(next.timestamp)}
        >
          <span className="shrink-0 text-dim">Next</span>
          <span className="truncate">{next.description}</span>
        </button>
      )}
    </section>
  );
};

type RowState = "past" | "active" | "upcoming";

const rowState = (index: number, activeIndex: number): RowState => {
  if (index === activeIndex) {
    return "active";
  }

  return index < activeIndex ? "past" : "upcoming";
};

interface MomentRowProps {
  event: PkaEvent;
  index: number;
  state: RowState;
  terms: string[];
  onSeek: (seconds: number) => void;
}

// Moments already passed are dimmed, so the list itself shows how far in you are.
const MomentRow = ({ event, index, state, terms, onSeek }: MomentRowProps) => (
  <button
    type="button"
    data-index={index}
    data-state={state}
    className="group relative grid w-full cursor-pointer grid-cols-[56px_1fr_auto] items-baseline gap-3 px-5 py-2.5 text-left text-[14px]/[1.4] transition-colors duration-100 hover:bg-raised data-[state=active]:bg-raised mobile:px-4"
    onClick={() => onSeek(event.timestamp)}
  >
    {state === "active" && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}
    <time className="text-[13px] tabular-nums text-muted group-data-[state=active]:font-medium group-data-[state=active]:text-primary group-data-[state=past]:text-dim">
      {formatTimestamp(event.timestamp)}
    </time>
    <span className="min-w-0 text-pretty text-secondary group-hover:text-ink group-data-[state=active]:text-ink group-data-[state=past]:text-dim group-data-[state=past]:group-hover:text-secondary">
      <Highlight text={event.description} terms={terms} />
    </span>
    <span className="text-[11px] tabular-nums text-dim">{formatDuration(event.lengthSeconds)}</span>
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

/**
 * The episode's moments: what's playing now, then every moment grouped by the
 * Hour it falls in — four-hour episodes need landmarks — filterable, and each
 * One a play target.
 */
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
  const hours = new Map<number, { event: PkaEvent; index: number }[]>();

  for (const [index, event] of events.entries()) {
    if (terms.every((term) => event.description.toLowerCase().includes(term))) {
      const hour = Math.floor(event.timestamp / SECONDS_PER_HOUR);

      const rows = hours.get(hour) ?? [];

      rows.push({ event, index });
      hours.set(hour, rows);
    }
  }

  const seek = (seconds: number) => setSeekRequest({ seconds, requestedAt: Date.now() });
  const active = events[activeIndex];

  return (
    <aside className="flex flex-col desktop:sticky desktop:top-(--header-h) desktop:h-[calc(100dvh-var(--header-h))] desktop:border-l desktop:border-line mobile:mt-4 mobile:border-t mobile:border-line">
      {active && (
        <NowPlaying event={active} next={events[activeIndex + 1]} position={position} onSeek={seek} />
      )}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 mobile:px-4">
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
        className="relative pb-4 desktop:min-h-0 desktop:flex-1 desktop:overflow-y-auto desktop:[scrollbar-color:var(--color-line-strong)_transparent] desktop:[scrollbar-width:thin]"
      >
        {events.length === 0 && (
          <p className="px-5 py-6 text-[14px]/[1.5] text-dim">Nobody has timestamped this episode yet.</p>
        )}
        {events.length > 0 && hours.size === 0 && (
          <p className="px-5 py-6 text-[14px]/[1.5] text-dim">No moments in this episode mention “{filter}”.</p>
        )}
        {[...hours].map(([hour, rows]) => (
          <section key={hour}>
            <h3 className="sticky top-0 z-[1] flex items-baseline justify-between bg-bg px-5 pt-3 pb-1.5 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase mobile:top-(--header-h) mobile:px-4">
              Hour {hour + 1}
              <span className="font-normal tracking-normal tabular-nums text-dim normal-case">
                {rows.length}
              </span>
            </h3>
            {rows.map(({ event, index }) => (
              <MomentRow
                key={event.timestamp}
                event={event}
                index={index}
                state={rowState(index, activeIndex)}
                terms={terms}
                onSeek={seek}
              />
            ))}
          </section>
        ))}
      </div>
    </aside>
  );
};
