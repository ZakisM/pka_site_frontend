import { formatEpisodeNumber, formatShortDate, formatTimestamp } from "@/lib/time";
import { Link2 } from "lucide-react";
import type { PkaEpisodeWithAll } from "@/lib/api";
import { displayTitle } from "@/lib/titles";
import { positionAtom } from "@/player/playerState";
import { useAtomValue } from "jotai";
import { useState } from "react";

const COPIED_FEEDBACK_MS = 1600;

const buttonStyles =
  "flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 border border-line px-3 text-[14px] tabular-nums text-secondary transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-ink";

/** Number, title and facts under the player, with the episode's actions. */
export const EpisodeBar = ({ episode }: { episode: PkaEpisodeWithAll }) => {
  const { videoId, title, lengthSeconds } = episode.youtubeDetails;
  const position = useAtomValue(positionAtom(videoId));
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
    <section className="mt-5 flex items-start gap-6 @max-[560px]:flex-col @max-[560px]:gap-3 mobile:mx-4 mobile:mt-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3.5">
          <span className="shrink-0 text-[20px] font-bold tabular-nums mobile:text-[17px]">
            <small className="mr-[5px] text-[11px] font-semibold tracking-[0.06em] text-muted">EP</small>
            {formatEpisodeNumber(episode.episode.number)}
          </span>
          <h1 className="min-w-0 text-[20px]/[1.3] font-medium tracking-[-0.01em] text-pretty mobile:text-[17px]/[1.3]">
            {displayTitle(title)}
          </h1>
        </div>
        <p className="mt-2 flex flex-wrap items-baseline gap-2 text-[13px] tabular-nums text-muted">
          <span>{formatShortDate(episode.episode.uploadDate)}</span>
          <span className="text-dim">·</span>
          <span>{formatTimestamp(lengthSeconds)}</span>
        </p>
      </div>
      <button type="button" className={`${buttonStyles} gap-2 px-3.5`} onClick={copyLink}>
        <Link2 className="size-[15px] stroke-2" />
        {copied ? "Link copied" : `Copy link at ${formatTimestamp(shareFrom)}`}
      </button>
    </section>
  );
};
