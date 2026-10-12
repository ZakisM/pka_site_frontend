import { formatEpisodeNumber, formatTimestamp } from "@/lib/time";
import type { WatchProgress } from "@/lib/progress";
import { thumbnailUrl } from "@/lib/youtube";
import { useState } from "react";

interface ThumbnailProps {
  episodeNumber: number;
  // The episode's running time, badged in the corner; omitted where the
  // Thumbnail stands for a moment rather than the whole episode.
  lengthSeconds?: number;
  videoId: string;
  progress?: WatchProgress;
}

type Source = "webp" | "jpg" | "none";

// WebP first, about an eighth smaller: thumbnails are most of what a page
// Downloads. YouTube has no WebP for many of its oldest videos, so those fall
// Back to the JPEG, and a removed video shows its episode number instead.
const FALLBACK: Record<Source, Source> = { webp: "jpg", jpg: "none", none: "none" };

// A missing thumbnail isn't an error: YouTube answers with a 120×90 grey
// Placeholder, which loads like any image. The real one is 320×180.
const PLACEHOLDER_MAX_WIDTH = 120;

/**
 * A flat placeholder that the image fades into once it has loaded — no
 * Spinner: dozens of these load at once and a field of spinners reads as slow.
 */
export const Thumbnail = ({ episodeNumber, lengthSeconds, videoId, progress }: ThumbnailProps) => {
  const [loaded, setLoaded] = useState(false);
  // Per video: a card reused for another episode starts again from WebP.
  const [attempt, setAttempt] = useState<{ videoId: string; source: Source }>({ videoId, source: "webp" });

  if (attempt.videoId !== videoId) {
    setAttempt({ videoId, source: "webp" });
  }

  const source = attempt.videoId === videoId ? attempt.source : "webp";

  return (
    <div className="@container relative aspect-video w-full overflow-hidden bg-raised">
      {source === "none" ? (
        <span className="absolute inset-0 grid place-items-center text-[26px] font-bold tabular-nums text-dim">
          {formatEpisodeNumber(episodeNumber)}
        </span>
      ) : (
        <img
          key={`${videoId}.${source}`}
          src={thumbnailUrl(videoId, source)}
          alt=""
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth <= PLACEHOLDER_MAX_WIDTH) {
              setAttempt({ videoId, source: FALLBACK[source] });
            } else {
              setLoaded(true);
            }
          }}
          onError={() => setAttempt({ videoId, source: FALLBACK[source] })}
        />
      )}
      {/* A plain overlay rather than a filter: filters on dozens of images are
          Expensive to repaint while scrolling, notably in Firefox. */}
      <span
        aria-hidden
        className="absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/[0.07]"
      />
      {lengthSeconds !== undefined && (
        <span className="absolute right-1.5 bottom-2 bg-black/80 px-[5px] py-0.5 text-[12px] font-medium tabular-nums text-white @max-[160px]:hidden">
          {formatTimestamp(lengthSeconds)}
        </span>
      )}
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
