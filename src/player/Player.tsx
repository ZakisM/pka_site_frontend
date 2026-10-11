import { type StartRequest, player, playerReady } from "./controller";
import { useEffect, useRef } from "react";
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
 * Are the only chrome inside this box, per the embed terms — so this renders a
 * Bare host element and hands it to the player controller.
 *
 * A slow connection would otherwise leave the box empty and black, so ticks
 * Fill that gap. They sit *behind* the host element: the iframe is opaque, so
 * The instant it exists it covers them, and nothing of ours is ever painted
 * Over the player.
 */
export const Player = ({ videoId, start }: PlayerProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ready = useStore(playerReady);
  const showLoader = useDebounced(!ready, LOADER_DELAY_MS) && !ready;

  // Before attaching, so the iframe is created already on the right episode
  // At the right time. Keyed on the request's id: the same request arriving
  // Again is not a new one.
  useEffect(() => {
    player.request(videoId, start);
    // eslint-disable-next-line exhaustive-deps
  }, [videoId, start?.id]);

  useEffect(() => {
    if (hostRef.current) {
      return player.attach(hostRef.current);
    }
  }, []);

  return (
    <div className="relative isolate size-full">
      <div ref={hostRef} className="size-full" />
      {showLoader && (
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <Ticks size="lg" label="Loading the player" />
        </div>
      )}
    </div>
  );
};
