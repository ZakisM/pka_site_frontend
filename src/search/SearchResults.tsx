import { type SearchRow, selectedIndexAtom } from "./searchState";
import {
  formatEpisodeNumber,
  formatShortDate,
  formatTimestamp,
} from "@/lib/time";
import { Skeleton } from "@/ui/Loaders";
import type { VListHandle } from "virtua";
import { VirtualList } from "@/ui/Scrollbar";
import { useAtom } from "jotai";

// Matches a desktop row, so the scrollbar is right before rows are measured.
const ROW_ESTIMATE_PX = 51;

const SKELETON_WIDTHS = [
  "68%", "84%", "52%", "76%", "61%", "89%",
  "58%", "72%", "80%", "64%", "86%", "55%",
];

interface SearchResultRowProps {
  row: SearchRow;
  index: number;
  href: string;
  onPlay: (row: SearchRow, fromStart: boolean) => void;
}

const SearchResultRow = ({ row, index, href, onPlay }: SearchResultRowProps) => {
  const [selectedIndex, setSelectedIndex] = useAtom(selectedIndexAtom);

  const selected = selectedIndex === index;
  const at =
    row.timestamp === undefined
      ? formatTimestamp(row.lengthSeconds)
      : `at ${formatTimestamp(row.timestamp)}`;

  return (
    <a
      href={href}
      data-selected={selected ? true : undefined}
      className="relative flex items-start gap-3 border-b border-hairline-soft px-4 py-3.5 desktop:grid desktop:grid-cols-[64px_minmax(0,1fr)_116px_88px] desktop:items-center desktop:gap-2 desktop:px-[26px] desktop:py-[15px] desktop:data-[selected]:bg-row-selected"
      onMouseMove={() => {
        if (!selected) {
          setSelectedIndex(index);
        }
      }}
      onClick={(event) => {
        // Leave modified clicks to the browser: the href carries ?timestamp so
        // Opening in a new tab or copying the link still shares the moment.
        if (event.metaKey || event.ctrlKey || event.altKey || event.button !== 0) {
          return;
        }

        event.preventDefault();
        setSelectedIndex(index);
        onPlay(row, event.shiftKey);
      }}
    >
      <span
        className={`shrink-0 font-raleway text-[17px] font-extrabold tabular-nums ${selected ? "text-primary" : "text-faint"}`}
      >
        #{formatEpisodeNumber(row.episodeNumber)}
      </span>
      {/* Desktop lays these out in the grid; mobile stacks the title over one
          date · timestamp line. */}
      <span className="flex min-w-0 flex-1 flex-col gap-1 desktop:contents">
        <span
          className={`text-[15px]/[1.3] mobile:text-pretty desktop:truncate desktop:pr-4 ${selected ? "text-ink" : "text-secondary"}`}
        >
          {row.title}
        </span>
        <span className="text-[11px] tabular-nums text-dimmer desktop:hidden">
          {formatShortDate(row.uploadDate)}
          {row.timestamp === undefined ? "" : ` · ${at}`}
        </span>
        <span className="text-[12px] text-dim mobile:hidden">
          {formatShortDate(row.uploadDate)}
        </span>
        <span className="text-[12px] tabular-nums text-dim mobile:hidden">{at}</span>
      </span>
      {/* Desktop marks the selection with a red edge; mobile has no hover, so
          the red episode number is the only cue it needs. */}
      {selected && (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-0.5 bg-primary mobile:hidden"
        />
      )}
    </a>
  );
};

// Holds the grid's real column positions during the first fetch of a term.
export const SearchResultsSkeleton = () => (
  <div aria-busy className="grow overflow-hidden">
    {SKELETON_WIDTHS.map((width, index) => (
      <div
        key={width}
        className="flex items-start gap-3 border-b border-hairline-soft px-4 py-3.5 desktop:grid desktop:grid-cols-[64px_minmax(0,1fr)_116px_88px] desktop:items-center desktop:gap-2 desktop:px-[26px] desktop:py-[15px]"
      >
        <Skeleton className="h-[14px] w-9 shrink-0" delay={index * 0.08} />
        <span className="flex min-w-0 flex-1 flex-col gap-1.5 desktop:contents">
          <Skeleton className="h-[13px]" style={{ width }} delay={index * 0.08} />
          <Skeleton
            className="h-[11px] w-[128px] desktop:w-[78px]"
            soft
            delay={index * 0.08}
          />
          <Skeleton className="h-[11px] w-[52px] mobile:hidden" soft delay={index * 0.08} />
        </span>
      </div>
    ))}
  </div>
);

interface SearchResultsProps {
  rows: SearchRow[];
  listRef: React.RefObject<VListHandle | null>;
  scrollKey: string;
  buildHref: (row: SearchRow) => string;
  onPlay: (row: SearchRow, fromStart: boolean) => void;
}

export const SearchResults = ({
  rows,
  listRef,
  scrollKey,
  buildHref,
  onPlay,
}: SearchResultsProps) => (
  <VirtualList
    className="flex min-h-0 grow"
    data={rows}
    listRef={listRef}
    itemSize={ROW_ESTIMATE_PX}
    scrollKey={scrollKey}
  >
    {(row, index) => (
      <SearchResultRow
        key={row.key}
        row={row}
        index={index}
        href={buildHref(row)}
        onPlay={onPlay}
      />
    )}
  </VirtualList>
);
