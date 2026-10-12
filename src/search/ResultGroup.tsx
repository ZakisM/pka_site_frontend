import { formatEpisodeNumber, formatShortDate, formatTimestamp, pluralise } from "@/lib/time";
import { Highlight } from "@/ui/Highlight";
import { Link } from "@tanstack/react-router";
import type { SearchGroup } from "@/lib/api";
import { Thumbnail } from "@/ui/Thumbnail";
import { displayTitle } from "@/lib/titles";
import { useEpisodeProgress } from "@/player/useEpisodeProgress";

// Every moment that matched, beside the episode they belong to. A long list
// Scrolls past its episode, so the episode stays pinned beside it (above it
// On phones, where the moments take the full width: beside a 112px thumbnail
// They wrapped a word per line).
const groupGrid =
  "grid animate-fade-in grid-cols-[208px_1fr] items-start gap-x-6 border-t border-line py-6 mobile:block";
const episodeStyles =
  "sticky top-6 flex flex-col gap-3 mobile:top-0 mobile:z-1 mobile:-mx-4 mobile:grid mobile:grid-cols-[112px_1fr] mobile:gap-x-3.5 mobile:bg-bg mobile:px-4 mobile:py-2";
const momentsStyles = "min-w-0 -mt-2 mobile:mt-1";

interface ResultGroupProps {
  group: SearchGroup;
  terms: string[];
  onPlay: (episodeNumber: number, seconds: number) => void;
  onMore: (episodeNumber: number) => void;
}

export const ResultGroup = ({ group: { episode, matchCount, hits }, terms, onPlay, onMore }: ResultGroupProps) => {
  const progress = useEpisodeProgress(episode);
  const episodeId = String(formatEpisodeNumber(episode.episodeNumber));
  const more = matchCount - hits.length;

  return (
    <section className={groupGrid}>
      <header className={episodeStyles}>
        <Link to="/watch/$episodeId" params={{ episodeId }} tabIndex={-1} className="group">
          <Thumbnail
            episodeNumber={episode.episodeNumber}
            lengthSeconds={episode.lengthSeconds}
            videoId={episode.videoId}
            progress={progress}
          />
        </Link>
        <Link to="/watch/$episodeId" params={{ episodeId }} className="group min-w-0">
          <span className="mb-[5px] flex items-baseline gap-2 text-[12px] tabular-nums text-muted">
            <span className="text-[13px] font-bold text-ink">{episodeId}</span>
            {formatShortDate(episode.uploadDate)}
          </span>
          <span className="line-clamp-3 text-[15px]/[1.4] font-medium decoration-line-strong underline-offset-3 group-hover:underline mobile:text-[15px]/[1.35]">
            <Highlight text={displayTitle(episode.title)} terms={terms} />
          </span>
        </Link>
      </header>
      {(hits.length > 0 || more > 0) && (
        <div className={momentsStyles}>
          {hits.map((hit) => (
            <button
              key={hit.timestamp}
              type="button"
              data-hit
              className="-mx-2.5 grid w-[calc(100%+20px)] cursor-pointer scroll-mt-6 grid-cols-[64px_1fr] gap-3 px-2.5 py-2 text-left text-[14px]/[1.45] text-secondary transition-colors duration-100 hover:bg-hover hover:text-ink data-selected:bg-hover data-selected:text-ink data-selected:shadow-[inset_2px_0_var(--color-primary)] mobile:scroll-mt-24 mobile:grid-cols-[58px_1fr] mobile:gap-3"
              onClick={() => onPlay(episode.episodeNumber, hit.timestamp)}
            >
              <time className="font-medium tabular-nums text-primary">{formatTimestamp(hit.timestamp)}</time>
              <span className="min-w-0">
                <Highlight text={hit.description} terms={terms} />
              </span>
            </button>
          ))}
          {/* Only from a backend that still sends the first few matches; one
              That sends them all leaves nothing more to open. */}
          {more > 0 && (
            <button
              type="button"
              className="mt-1.5 cursor-pointer text-[13px] text-muted transition-colors duration-150 hover:text-ink"
              onClick={() => onMore(episode.episodeNumber)}
            >
              {pluralise(more, "more moment")} in this episode
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export const ResultGroupSkeleton = () => (
  <div aria-hidden className={groupGrid}>
    <div className="flex flex-col gap-3 mobile:grid mobile:grid-cols-[112px_1fr] mobile:gap-x-3.5 mobile:py-2">
      <span className="pka-sk aspect-video w-full" />
      <div className="flex flex-col gap-2.5">
        <span className="pka-sk h-3 w-28" />
        <span className="pka-sk h-4 w-3/4" />
      </div>
    </div>
    <div className="flex flex-col gap-4 pt-1 mobile:mt-3">
      <span className="pka-sk pka-sk--soft h-3.5 w-11/12" />
      <span className="pka-sk pka-sk--soft h-3.5 w-4/5" />
      <span className="pka-sk pka-sk--soft h-3.5 w-2/3" />
    </div>
  </div>
);
