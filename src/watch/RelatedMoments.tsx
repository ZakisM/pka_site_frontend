import { formatEpisodeNumber, formatShortDate, formatTimestamp } from "@/lib/time";
import type { PkaEvent } from "@/lib/api";
import { Thumbnail } from "@/ui/Thumbnail";
import { playFrom } from "@/lib/intents";
import { relatedQuery } from "@/lib/queries";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

interface RelatedMomentsProps {
  episodeNumber: number;
  moment: PkaEvent;
  // Shown instead when nothing elsewhere is close enough to be worth showing.
  fallback: React.JSX.Element;
}

/**
 * The moment now playing, everywhere else it came up: other episodes' moments
 * About the same subject, each opening that episode at that point.
 */
export const RelatedMoments = ({ episodeNumber, moment, fallback }: RelatedMomentsProps) => {
  const navigate = useNavigate();
  const { data: related, isPending } = useQuery(relatedQuery(episodeNumber, moment.timestamp));

  if (isPending) {
    return null;
  }

  if (!related || related.length === 0) {
    return fallback;
  }

  const play = (target: number, seconds: number) => {
    void navigate({
      to: "/watch/$episodeId",
      params: { episodeId: String(formatEpisodeNumber(target)) },
      state: playFrom(target, seconds),
    });
  };

  return (
    <section className="@container mobile:px-4">
      <h2 className="mb-4 text-[15px] font-semibold">In other episodes</h2>
      {/* Keyed by what it shows, so the list fades as playback moves on to
          A moment with different matches, instead of snapping. */}
      <div
        key={related.map((item) => `${item.episode.episodeNumber}-${item.timestamp}`).join("|")}
        className="grid animate-fade-in gap-x-6 gap-y-4 @[720px]:grid-cols-2"
      >
        {related.map((item) => (
          <button
            key={`${item.episode.episodeNumber}-${item.timestamp}`}
            type="button"
            className="group grid cursor-pointer grid-cols-[148px_1fr] items-start gap-3.5 text-left"
            onClick={() => play(item.episode.episodeNumber, item.timestamp)}
          >
            <Thumbnail episodeNumber={item.episode.episodeNumber} videoId={item.episode.videoId} />
            <span className="min-w-0">
              <span className="flex items-baseline gap-2 text-[12px] tabular-nums text-muted">
                <span className="text-[13px] font-bold text-ink">
                  {formatEpisodeNumber(item.episode.episodeNumber)}
                </span>
                <span className="font-medium text-primary">{formatTimestamp(item.timestamp)}</span>
                {formatShortDate(item.episode.uploadDate)}
              </span>
              <span className="mt-1 line-clamp-3 block text-[14px]/[1.4] text-secondary group-hover:text-ink">
                {item.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
