import { formatDuration, formatEpisodeNumber, formatShortDate, formatTimestamp, pluralise } from "@/lib/time";
import { Link } from "@tanstack/react-router";
import type { PkaEpisodeSearchResult } from "@/lib_wasm";
import { Thumbnail } from "@/ui/Thumbnail";
import type { WatchProgress } from "@/lib/progress";
import { displayTitle } from "@/lib/titles";
import { useEpisodeProgress } from "@/player/useEpisodeProgress";

const detailFor = (episode: PkaEpisodeSearchResult, progress: WatchProgress | undefined) => {
  if (progress?.finished) {
    return "Watched";
  }

  if (progress) {
    return `Resume at ${formatTimestamp(progress.position)} · ${formatDuration(episode.lengthSeconds - progress.position)} left`;
  }

  return episode.eventCount > 0 ? pluralise(episode.eventCount, "moment") : undefined;
};

/** Thumbnail, number and date, title. Opening it resumes where you left off. */
export const EpisodeCard = ({ episode }: { episode: PkaEpisodeSearchResult }) => {
  const progress = useEpisodeProgress(episode);
  const detail = detailFor(episode, progress);

  return (
    <Link
      to="/watch/$episodeId"
      params={{ episodeId: String(formatEpisodeNumber(episode.episodeNumber)) }}
      className="group flex min-w-0 flex-col gap-3"
    >
      <Thumbnail
        episodeNumber={episode.episodeNumber}
        lengthSeconds={episode.lengthSeconds}
        videoId={episode.videoId}
        progress={progress}
      />
      <span className="flex items-baseline gap-2 text-[12px] tabular-nums text-muted">
        <span className="text-[13px] font-bold text-ink">
          {formatEpisodeNumber(episode.episodeNumber)}
        </span>
        {formatShortDate(episode.uploadDate)}
      </span>
      <span className="line-clamp-2 text-[15px]/[1.4] font-medium decoration-line-strong underline-offset-3 group-hover:underline mobile:text-[14px]/[1.4]">
        {displayTitle(episode.title)}
      </span>
      {detail && (
        <span className={`-mt-1 text-[12px] tabular-nums ${progress && !progress.finished ? "text-secondary" : "text-dim"}`}>
          {detail}
        </span>
      )}
    </Link>
  );
};

export const EpisodeCardSkeleton = () => (
  <div className="flex flex-col gap-3" aria-hidden>
    <span className="pka-sk aspect-video w-full" />
    <span className="pka-sk h-3 w-24" />
    <span className="pka-sk h-4 w-4/5" />
  </div>
);

export const gridStyles =
  "grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-5 gap-y-9 mobile:grid-cols-1 mobile:gap-y-7 xs:mobile:grid-cols-2 xs:mobile:gap-x-3";
