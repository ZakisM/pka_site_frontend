import { formatEpisodeNumber, formatShortDate, formatTimestamp, pluralise } from "@/lib/time";
import type { ResultGroup as Group } from "./useGroupedResults";
import { Highlight } from "@/ui/Highlight";
import { Link } from "@tanstack/react-router";
import { Thumbnail } from "@/ui/Thumbnail";
import { displayTitle } from "@/lib/titles";
import { useEpisodeProgress } from "@/player/useEpisodeProgress";

const HITS_SHOWN = 3;

interface ResultGroupProps {
  group: Group;
  terms: string[];
  onPlay: (episodeNumber: number, seconds: number) => void;
  onMore: (episodeNumber: number) => void;
}

export const ResultGroup = ({ group: { episode, hits }, terms, onPlay, onMore }: ResultGroupProps) => {
  const progress = useEpisodeProgress(episode);
  const episodeId = String(formatEpisodeNumber(episode.episodeNumber));

  return (
    <section className="grid grid-cols-[208px_1fr] gap-6 border-t border-line py-6 first:border-t-0 first:pt-0 mobile:grid-cols-[112px_1fr] mobile:gap-3.5">
      <Link to="/watch/$episodeId" params={{ episodeId }} tabIndex={-1} className="group self-start">
        <Thumbnail
          episodeNumber={episode.episodeNumber}
          lengthSeconds={episode.lengthSeconds}
          videoId={episode.videoId}
          progress={progress}
        />
      </Link>
      <div className="min-w-0">
        <Link to="/watch/$episodeId" params={{ episodeId }} className="group mb-2 block">
          <span className="mb-[5px] flex items-baseline gap-2 text-[12px] tabular-nums text-muted">
            <span className="text-[13px] font-bold text-ink">{episodeId}</span>
            {formatShortDate(episode.uploadDate)}
          </span>
          <span className="line-clamp-2 text-[16px]/[1.4] font-medium decoration-line-strong underline-offset-3 group-hover:underline mobile:text-[15px]/[1.4]">
            <Highlight text={displayTitle(episode.title)} terms={terms} />
          </span>
        </Link>
        {hits.slice(0, HITS_SHOWN).map((hit) => (
          <button
            key={hit.timestamp}
            type="button"
            data-hit
            className="-mx-2.5 grid w-[calc(100%+20px)] cursor-pointer grid-cols-[64px_1fr] gap-3 px-2.5 py-2 text-left text-[14px]/[1.45] text-secondary transition-colors duration-100 hover:bg-hover hover:text-ink aria-selected:bg-hover aria-selected:text-ink aria-selected:shadow-[inset_2px_0_var(--color-primary)] mobile:grid-cols-[54px_1fr] mobile:gap-2"
            onClick={() => onPlay(episode.episodeNumber, hit.timestamp)}
          >
            <time className="font-medium tabular-nums text-primary">{formatTimestamp(hit.timestamp)}</time>
            <span>
              <Highlight text={hit.description} terms={terms} />
            </span>
          </button>
        ))}
        {hits.length > HITS_SHOWN && (
          <button
            type="button"
            className="mt-1.5 cursor-pointer text-[13px] text-muted transition-colors duration-150 hover:text-ink"
            onClick={() => onMore(episode.episodeNumber)}
          >
            {pluralise(hits.length - HITS_SHOWN, "more moment")} in this episode
          </button>
        )}
      </div>
    </section>
  );
};

export const ResultGroupSkeleton = () => (
  <div aria-hidden className="grid grid-cols-[208px_1fr] gap-6 border-t border-line py-6 first:border-t-0 first:pt-0 mobile:grid-cols-[112px_1fr] mobile:gap-3.5">
    <span className="pka-sk aspect-video w-full" />
    <div className="flex flex-col gap-2.5">
      <span className="pka-sk h-3 w-28" />
      <span className="pka-sk h-4 w-3/4" />
      <span className="pka-sk pka-sk--soft mt-2 h-3.5 w-11/12" />
      <span className="pka-sk pka-sk--soft h-3.5 w-4/5" />
    </div>
  </div>
);
