import { player, playerFailed, playerReady } from "./controller";
import { useEffect, useRef } from "react";
import type { StartRequest } from "./controller";
import { Ticks } from "@/ui/Loaders";
import { useDebounced } from "@/lib/hooks";
import { useStore } from "@/lib/store";

// Long enough that a warm load never flashes it.
const LOADER_DELAY_MS = 400;

interface PlayerProps {
  videoId: string;
  start: StartRequest | undefined;
}

/**
 * The YouTube iframe. Nothing may be drawn over it — YouTube's own controls
 * are the only chrome inside this box, per the embed terms — so this renders a
 * bare host element and hands it to the player controller.
 *
 * A slow connection would otherwise leave the box empty and black, so ticks
 * fill that gap. They sit *behind* the host element: the iframe is opaque, so
 * the instant it exists it covers them, and nothing of ours is ever painted
 * over the player.
 */
export const Player = ({ videoId, start }: PlayerProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ready = useStore(playerReady);
  const failed = useStore(playerFailed);
  const showLoader = useDebounced(!ready, LOADER_DELAY_MS) && !ready && !failed;

  // Before attaching, so the iframe is created already on the right episode
  // at the right time. Sending the same request again is harmless: the
  // controller acts on each one once.
  useEffect(() => {
    player.request(videoId, start);
  }, [videoId, start]);

  useEffect(() => {
    const host = hostRef.current;

    return host ? player.attach(host) : undefined;
  }, []);

  return (
    <div className="relative isolate size-full">
      <div ref={hostRef} className="size-full" />
      {showLoader && (
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <Ticks size="lg" label="Loading the player" />
        </div>
      )}
      {/* There is no iframe to draw over: its script never arrived. */}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-[14px]/[1.6] text-muted">
            YouTube’s player didn’t load. A content blocker or the connection may be stopping it.
          </p>
          <button
            type="button"
            className="cursor-pointer border border-line px-3.5 py-2 text-[13px] text-muted transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-ink"
            onClick={player.retry}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};
