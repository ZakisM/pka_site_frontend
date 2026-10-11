import { formatEpisodeNumber, formatTimestamp } from "@/lib/time";
import type { WatchProgress } from "@/lib/progress";
import { thumbnailUrl } from "@/lib/youtube";
import { useState } from "react";

interface ThumbnailProps {
  episodeNumber: number;
  lengthSeconds: number;
  videoId?: string;
  progress?: WatchProgress;
}

/**
 * A flat placeholder that the image fades into once it has loaded — no
 * Spinner: dozens of these load at once and a field of spinners reads as slow.
 * Without a video id (or if YouTube has none) the episode number stands in.
 */
export const Thumbnail = ({
  episodeNumber,
  lengthSeconds,
  videoId,
  progress,
}: ThumbnailProps) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="@container relative aspect-video w-full overflow-hidden bg-raised">
      {videoId && !failed ? (
        <img
          key={videoId}
          src={thumbnailUrl(videoId)}
          alt=""
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 size-full object-cover transition-[opacity,filter] duration-300 group-hover:brightness-115 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-[26px] font-bold tabular-nums text-dim">
          {formatEpisodeNumber(episodeNumber)}
        </span>
      )}
      <span className="absolute right-1.5 bottom-2 bg-black/80 px-[5px] py-0.5 text-[12px] font-medium tabular-nums text-white @max-[160px]:hidden">
        {formatTimestamp(lengthSeconds)}
      </span>
      {progress && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-white/25">
          <span
            className="block h-full bg-primary"
            style={{ width: `${(progress.finished ? 1 : progress.fraction) * 100}%` }}
          />
        </span>
      )}
    </div>
  );
};
