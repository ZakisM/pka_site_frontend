import { Check, Copy } from "lucide-react";
import { formatEpisodeNumber, formatShortDate, formatTimestamp } from "@/lib/time";
import type { PkaEpisodeWithAll } from "@/lib/api";
import { displayTitle } from "@/lib/titles";
import { usePosition } from "@/player/watchHistory";
import { useState } from "react";

const COPIED_FEEDBACK_MS = 1600;

/** Number, title and facts under the player, with the episode's actions. */
export const EpisodeBar = ({ episode }: { episode: PkaEpisodeWithAll }) => {
  const { videoId, title, lengthSeconds } = episode.youtubeDetails;
  const position = usePosition(videoId);
  const [copied, setCopied] = useState(false);

  const shareFrom = Math.floor(position);

  // The URL is the one place a timestamp still belongs: for other people.
  const copyLink = async () => {
    const url = new URL(`/watch/${formatEpisodeNumber(episode.episode.number)}`, globalThis.location.origin);

    url.searchParams.set("timestamp", String(shareFrom));

    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard permission denied — nothing useful to fall back to.
    }
  };

  return (
    <section className="mt-4 animate-fade-in mobile:mx-4 mobile:mt-3">
      {/* The same shape as an episode card: number and facts, then the title. */}
      <div className="flex items-center gap-2 text-[13px] tabular-nums text-muted">
        <span className="text-[14px] font-bold text-ink">{formatEpisodeNumber(episode.episode.number)}</span>
        <span>{formatShortDate(episode.episode.uploadDate)}</span>
        <span className="text-dim">·</span>
        <span>{formatTimestamp(lengthSeconds)}</span>
        <button
          type="button"
          aria-label={copied ? "Link copied" : `Copy a link to ${formatTimestamp(shareFrom)}`}
          title={copied ? "Link copied" : `Copy a link to ${formatTimestamp(shareFrom)}`}
          className="-my-1.5 -mr-2 ml-auto grid size-8 shrink-0 cursor-pointer place-items-center text-muted transition-colors duration-150 hover:bg-raised hover:text-ink"
          onClick={copyLink}
        >
          {copied ? (
            <Check className="size-4 animate-fade-in stroke-2 text-ink" />
          ) : (
            <Copy className="size-4 stroke-[1.75]" />
          )}
        </button>
      </div>
      <h1 className="mt-1.5 text-[22px]/[1.3] font-medium tracking-[-0.01em] text-pretty mobile:text-[18px]/[1.3]">
        {displayTitle(title)}
      </h1>
    </section>
  );
};
