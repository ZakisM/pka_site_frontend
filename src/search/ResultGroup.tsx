import { formatEpisodeNumber, formatShortDate, formatTimestamp, pluralise } from "@/lib/time";
import { Highlight } from "@/ui/Highlight";
import { Link } from "@tanstack/react-router";
import type { SearchGroup } from "@/lib/api";
import { Thumbnail } from "@/ui/Thumbnail";
import { displayTitle } from "@/lib/titles";
import { useEpisodeProgress } from "@/player/useEpisodeProgress";

// On phones the moments drop below the thumbnail and title so they get the
// Full width; beside a 112px thumbnail they wrapped a word per line. Every
// Group draws the hairline above it: on wide screens they sit two abreast.
const groupGrid =
  "grid grid-cols-[208px_1fr] content-start gap-x-6 gap-y-2 border-t border-line py-6 mobile:grid-cols-[112px_1fr] mobile:gap-x-3.5 mobile:gap-y-3";

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
      <Link
        to="/watch/$episodeId"
        params={{ episodeId }}
        tabIndex={-1}
        className="group row-span-2 self-start mobile:row-span-1"
      >
        <Thumbnail
          episodeNumber={episode.episodeNumber}
          lengthSeconds={episode.lengthSeconds}
          videoId={episode.videoId}
          progress={progress}
        />
      </Link>
      <Link to="/watch/$episodeId" params={{ episodeId }} className="group min-w-0 self-start">
        <span className="mb-[5px] flex items-baseline gap-2 text-[12px] tabular-nums text-muted">
          <span className="text-[13px] font-bold text-ink">{episodeId}</span>
          {formatShortDate(episode.uploadDate)}
        </span>
        <span className="line-clamp-2 text-[16px]/[1.4] font-medium decoration-line-strong underline-offset-3 group-hover:underline mobile:line-clamp-3 mobile:text-[15px]/[1.35]">
          <Highlight text={displayTitle(episode.title)} terms={terms} />
        </span>
      </Link>
      {(hits.length > 0 || more > 0) && (
        <div className="col-start-2 min-w-0 mobile:col-span-2 mobile:col-start-1">
          {hits.map((hit) => (
            <button
              key={hit.timestamp}
              type="button"
              data-hit
              className="-mx-2.5 grid w-[calc(100%+20px)] cursor-pointer grid-cols-[64px_1fr] gap-3 px-2.5 py-2 text-left text-[14px]/[1.45] text-secondary transition-colors duration-100 hover:bg-hover hover:text-ink data-selected:bg-hover data-selected:text-ink data-selected:shadow-[inset_2px_0_var(--color-primary)] mobile:grid-cols-[58px_1fr] mobile:gap-2"
              onClick={() => onPlay(episode.episodeNumber, hit.timestamp)}
            >
              <time className="font-medium tabular-nums text-primary">{formatTimestamp(hit.timestamp)}</time>
              <span className="min-w-0">
                <Highlight text={hit.description} terms={terms} />
              </span>
            </button>
          ))}
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
    <span className="pka-sk row-span-2 aspect-video w-full mobile:row-span-1" />
    <div className="flex flex-col gap-2.5">
      <span className="pka-sk h-3 w-28" />
      <span className="pka-sk h-4 w-3/4" />
    </div>
    <div className="col-start-2 flex flex-col gap-2.5 pt-1 mobile:col-span-2 mobile:col-start-1">
      <span className="pka-sk pka-sk--soft h-3.5 w-11/12" />
      <span className="pka-sk pka-sk--soft h-3.5 w-4/5" />
    </div>
  </div>
);
