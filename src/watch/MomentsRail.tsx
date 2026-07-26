import { formatDuration, formatTimestamp } from "@/lib/time";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { PkaEvent } from "@/lib/api";
import type { VListHandle } from "virtua";
import { VirtualList } from "@/ui/Scrollbar";
import { seekRequestAtom } from "@/player/playerState";
import { useSetAtom } from "jotai";

// Enough to place the scrollbar before rows are measured.
const ROW_ESTIMATE_PX = 72;
// Let a burst of position updates settle before chasing the active row.
const FOLLOW_DELAY_MS = 50;

interface MomentRowProps {
  event: PkaEvent;
  active: boolean;
  // Fraction (0–1) through this moment; only meaningful when active, so
  // Inactive rows never re-render on playback ticks.
  progress: number;
  onSeek: (seconds: number) => void;
}

const MomentRow = ({ event, active, progress, onSeek }: MomentRowProps) => (
  <button
    type="button"
    data-active={active ? true : undefined}
    className="group relative flex w-full cursor-pointer items-start gap-3.5 border-b border-hairline-soft px-4 py-3.5 text-left transition-colors duration-150 not-data-[active]:hover:bg-row-hover data-[active]:bg-row-active desktop:px-[18px] desktop:py-[13px]"
    onClick={() => onSeek(event.timestamp)}
  >
    <time className="w-[50px] shrink-0 pt-px text-[12px] font-medium tabular-nums text-dim transition-colors duration-150 group-data-[active]:text-primary">
      {formatTimestamp(event.timestamp)}
    </time>
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[14px]/[1.35] text-pretty text-secondary transition-colors duration-150 group-data-[active]:font-medium group-data-[active]:text-ink">
        {event.description}
      </span>
      <span className="text-[11px] tabular-nums text-dimmer">
        {formatDuration(event.lengthSeconds)}
      </span>
    </span>
    {active && (
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 bg-primary transition-[width] duration-300 ease-in-out"
        style={{ width: `${(progress * 100).toFixed(1)}%` }}
      />
    )}
  </button>
);

// Keeps the playing moment in view without animating past every row above it
// On the first paint.
const useFollowActive = (
  listRef: React.RefObject<VListHandle | null>,
  activeIndex: number,
) => {
  const previousRef = useRef(activeIndex);
  // eslint-disable-next-line no-useless-undefined
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    listRef.current?.scrollToIndex(previousRef.current, { align: "center" });

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (previousRef.current === activeIndex) {
      return;
    }

    // Playback walks one moment at a time, and gliding to the next row reads
    // Nicely. Anything further — a rail click, or a new episode landing on a
    // Different part of a differently sized list — snaps instead: a smooth
    // Scroll animates towards an offset derived from row heights that may
    // Still be settling, and lands short.
    const adjacent = Math.abs(activeIndex - previousRef.current) === 1;

    previousRef.current = activeIndex;
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      listRef.current?.scrollToIndex(activeIndex, {
        align: adjacent ? "start" : "center",
        smooth: adjacent,
      });
    }, FOLLOW_DELAY_MS);
  }, [listRef, activeIndex]);
};

interface MomentsRailProps {
  events: PkaEvent[];
  episodeNumber: number;
  activeIndex: number;
  position: number;
}

/** The episode's index of moments: the product, and every row is a play target. */
export const MomentsRail = ({
  events,
  episodeNumber,
  activeIndex,
  position,
}: MomentsRailProps) => {
  const setSeekRequest = useSetAtom(seekRequestAtom);
  const listRef = useRef<VListHandle | null>(null);

  useFollowActive(listRef, activeIndex);

  const count = `${events.length} ${events.length === 1 ? "moment" : "moments"}`;

  return (
    <aside className="flex min-h-0 flex-col bg-raised mobile:flex-1 desktop:w-[381px] desktop:shrink-0 desktop:border-l desktop:border-hairline">
      <div className="flex h-[39px] shrink-0 items-center justify-between border-b border-hairline px-4 desktop:h-[45px] desktop:px-[18px]">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink mobile:tracking-[0.16em]">
          Moments
        </span>
        <span className="text-[12px] tabular-nums text-dimmer mobile:text-[11px]">
          <span className="desktop:hidden">EP {episodeNumber} · </span>
          {count}
        </span>
      </div>
      <VirtualList
        className="min-h-0 flex-1"
        data={events}
        listRef={listRef}
        itemSize={ROW_ESTIMATE_PX}
      >
        {(event, index) => {
          const active = index === activeIndex;

          return (
            <MomentRow
              key={event.timestamp}
              event={event}
              active={active}
              progress={
                active
                  ? Math.min(
                      1,
                      Math.max(
                        0,
                        (position - event.timestamp) / event.lengthSeconds,
                      ),
                    )
                  : 0
              }
              onSeek={(seconds) =>
                setSeekRequest({ seconds, requestedAt: Date.now() })
              }
            />
          );
        }}
      </VirtualList>
    </aside>
  );
};
