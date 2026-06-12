import { type SearchRow, selectedIndexAtom } from "./searchState";
import { Skeleton, Ticks } from "@/ui/Loaders";
import {
  formatEpisodeNumber,
  formatShortDate,
  formatTimestamp,
} from "@/lib/time";
import { useEffect, useRef } from "react";
import type { PkaEvent } from "@/lib/api";
import { episodeQuery } from "@/lib/queries";
import { useAtomValue } from "jotai";
import { useDebounced } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";

// Hovering a long list would otherwise fire an episode fetch per row.
const HOVER_SETTLE_MS = 120;

const TIMELINE_WIDTHS = [
  "72%", "88%", "54%", "80%", "66%", "92%", "58%", "76%", "84%", "62%",
];

// A long episode buries the matched moment below the fold, which defeats the
// Point of the panel. ScrollTop is written directly so the takeover itself is
// Never scrolled.
const useCentredMatch = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  events: PkaEvent[],
  timestamp: number | undefined,
) => {
  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const match = container.querySelector<HTMLElement>("[data-match]");

    if (!match) {
      container.scrollTop = 0;

      return;
    }

    const containerBox = container.getBoundingClientRect();
    const matchBox = match.getBoundingClientRect();

    container.scrollTop +=
      matchBox.top - containerBox.top - (containerBox.height - matchBox.height) / 2;
  }, [containerRef, events, timestamp]);
};

const MatchedMoment = ({ row }: { row: SearchRow }) => {
  const start = row.timestamp ?? 0;

  return (
    <div className="shrink-0 border-b border-hairline px-[26px] pt-[18px] pb-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
        {formatTimestamp(start)} – {formatTimestamp(start + row.lengthSeconds)}
      </span>
      <h4 className="pt-2 font-raleway text-[23px]/[1.16] font-bold text-pretty">
        {row.title}
      </h4>
    </div>
  );
};

interface TimelineRowProps {
  event: PkaEvent;
  episodeNumber: number;
  match: boolean;
  onPlay: (episodeNumber: number, seconds: number) => void;
}

const TimelineRow = ({ event, episodeNumber, match, onPlay }: TimelineRowProps) => (
  <button
    type="button"
    data-match={match ? true : undefined}
    className="group flex w-full cursor-pointer items-start gap-3.5 border-b border-hairline-soft px-[26px] py-[11px] text-left transition-colors duration-150 hover:bg-row-hover data-[match]:bg-row-selected"
    onClick={() => onPlay(episodeNumber, event.timestamp)}
  >
    <span className="w-[52px] shrink-0 pt-px text-[12px] tabular-nums text-dimmer group-data-[match]:text-primary">
      {formatTimestamp(event.timestamp)}
    </span>
    <span className="min-w-0 flex-1 text-[13px]/[1.35] text-pretty text-muted group-data-[match]:text-ink">
      {event.description}
    </span>
    <span
      aria-hidden
      className="shrink-0 pt-0.5 text-[9px] text-fainter group-data-[match]:text-primary"
    >
      ▶
    </span>
  </button>
);

interface SearchPreviewProps {
  rows: SearchRow[];
  showMatch: boolean;
  onPlay: (episodeNumber: number, seconds: number) => void;
}

/**
 * The selected result's whole episode. Every row plays from its own timestamp,
 * So an earlier moment in that episode is one click away.
 */
export const SearchPreview = ({ rows, showMatch, onPlay }: SearchPreviewProps) => {
  // Subscribed here rather than in the parent: the parent owns the result
  // Rows, and re-rendering those on every hover is what made this feel laggy.
  const selectedIndex = useAtomValue(selectedIndexAtom);
  const row = rows[selectedIndex];

  const timelineRef = useRef<HTMLDivElement | null>(null);
  const episodeId = useDebounced(row && String(row.episodeNumber), HOVER_SETTLE_MS);

  const { data } = useQuery({
    ...episodeQuery(episodeId ?? ""),
    enabled: Boolean(episodeId),
  });

  // Only trust the fetched episode once it is the one selected — otherwise the
  // Previous row's timeline shows under the new row's header.
  const episode =
    data && row && data.episode.number === row.episodeNumber ? data : undefined;
  const events = episode?.events ?? [];

  useCentredMatch(timelineRef, events, row?.timestamp);

  // Nothing selected (no results) — the empty state takes the full width.
  if (!row) {
    return null;
  }

  return (
    <aside className="flex w-[440px] shrink-0 flex-col bg-raised">
      <div className="shrink-0 border-b border-hairline px-[26px] pt-[22px] pb-5">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[11px] tracking-[0.14em] text-dimmer">EP</span>
          <span className="font-raleway text-[26px] font-extrabold tabular-nums">
            {formatEpisodeNumber(row.episodeNumber)}
          </span>
          <span className="ml-auto text-[12px] tabular-nums text-dim">
            {formatShortDate(row.uploadDate)}
            {episode && ` · ${formatTimestamp(episode.youtubeDetails.lengthSeconds)}`}
          </span>
        </div>
        {/* On the Moments tab the row carries the moment's title, not the
            episode's, so this line waits on the fetch — hold its shape. */}
        {episode ? (
          <p className="pt-2 text-[13px] text-pretty text-muted">
            {episode.youtubeDetails.title}
          </p>
        ) : (
          <span className="flex pt-2">
            <Skeleton className="h-[13px] w-[72%]" soft />
          </span>
        )}
      </div>

      {showMatch && row.timestamp !== undefined && <MatchedMoment row={row} />}

      <div className="flex shrink-0 items-center justify-between px-[26px] pt-3.5 pb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-dimmer">
          Full episode timeline
        </span>
        {episode ? (
          <span className="text-[11px] tabular-nums text-faint">
            {events.length} {events.length === 1 ? "moment" : "moments"}
          </span>
        ) : (
          <Ticks size="sm" tone="dim" label="Loading timeline" />
        )}
      </div>

      <div ref={timelineRef} className="min-h-0 flex-1 overflow-y-auto">
        {episode
          ? events.map((event) => (
              <TimelineRow
                key={event.timestamp}
                event={event}
                episodeNumber={row.episodeNumber}
                match={event.timestamp === row.timestamp}
                onPlay={onPlay}
              />
            ))
          : TIMELINE_WIDTHS.map((width, index) => (
              <div
                key={width}
                className="flex items-start gap-3.5 border-b border-hairline-soft px-[26px] py-[11px]"
              >
                <Skeleton
                  className="mt-px h-[12px] w-[52px] shrink-0"
                  delay={index * 0.08}
                />
                <Skeleton className="h-[13px]" style={{ width }} delay={index * 0.08} />
              </div>
            ))}
      </div>

      <div className="flex h-[41px] shrink-0 items-center border-t border-hairline px-[26px] text-[11px] text-dimmer">
        Click any moment to play from there
      </div>
    </aside>
  );
};
