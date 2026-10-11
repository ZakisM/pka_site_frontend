import { ChevronLeft, ChevronRight, Link2 } from "lucide-react";
import { formatEpisodeNumber, formatShortDate, formatTimestamp } from "@/lib/time";
import { Link } from "@tanstack/react-router";
import type { PkaEpisodeWithAll } from "@/lib/api";
import { allEpisodesQuery } from "@/lib/queries";
import { displayTitle } from "@/lib/titles";
import { positionAtom } from "@/player/playerState";
import { useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const COPIED_FEEDBACK_MS = 1600;

const buttonStyles =
  "flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 border border-line px-3 text-[14px] tabular-nums text-secondary transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-ink";

/** The episode's neighbours in the archive, which can include bonus 524.1s. */
const useNeighbours = (episodeNumber: number) => {
  const { data: episodes } = useQuery(allEpisodesQuery);
  const index = episodes?.findIndex((episode) => episode.episodeNumber === episodeNumber) ?? -1;

  return index === -1
    ? {}
    : { older: episodes?.[index + 1], newer: episodes?.[index - 1] };
};

/** Number, title and facts under the player, with the episode's actions. */
export const EpisodeBar = ({ episode }: { episode: PkaEpisodeWithAll }) => {
  const { videoId, title, lengthSeconds } = episode.youtubeDetails;
  const position = useAtomValue(positionAtom(videoId));
  const { older, newer } = useNeighbours(episode.episode.number);
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
    <section className="mt-5 flex items-start gap-6 max-[1100px]:flex-col max-[1100px]:gap-4 mobile:mx-4 mobile:mt-4">
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
      <div className="flex shrink-0 gap-2 mobile:w-full">
        {older && (
          <Link
            to="/watch/$episodeId"
            params={{ episodeId: String(formatEpisodeNumber(older.episodeNumber)) }}
            title="Previous episode"
            className={buttonStyles}
          >
            <ChevronLeft className="size-3.5 stroke-2" />
            {formatEpisodeNumber(older.episodeNumber)}
          </Link>
        )}
        {newer && (
          <Link
            to="/watch/$episodeId"
            params={{ episodeId: String(formatEpisodeNumber(newer.episodeNumber)) }}
            title="Next episode"
            className={buttonStyles}
          >
            {formatEpisodeNumber(newer.episodeNumber)}
            <ChevronRight className="size-3.5 stroke-2" />
          </Link>
        )}
        <button type="button" className={`${buttonStyles} gap-2 px-3.5 mobile:flex-1`} onClick={copyLink}>
          <Link2 className="size-[15px] stroke-2" />
          {copied ? "Link copied" : `Copy link at ${formatTimestamp(shareFrom)}`}
        </button>
      </div>
    </section>
  );
};
