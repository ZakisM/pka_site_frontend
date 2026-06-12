import { type PlayerRequest, usePlayer } from "./usePlayer";
import { Ticks } from "@/ui/Loaders";
import { useDebounced } from "@/lib/hooks";

// Long enough that a warm load never flashes it.
const LOADER_DELAY_MS = 400;

/**
 * The YouTube iframe. Nothing may be drawn over it — YouTube's own controls
 * Are the only chrome inside this box, per the embed terms — so this renders a
 * Bare host element and hands the rest to the player hook.
 *
 * A slow connection would otherwise leave the box empty and black, so ticks
 * Fill that gap. They sit *behind* the host element: the iframe is opaque, so
 * The instant it exists it covers them, and nothing of ours is ever painted
 * Over the player.
 */
export const Player = (request: PlayerRequest) => {
  const { hostRef, ready } = usePlayer(request);
  const showLoader = useDebounced(!ready, LOADER_DELAY_MS) && !ready;

  return (
    <div className="relative flex grow">
      <div ref={hostRef} className="size-full" />
      {showLoader && (
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <Ticks size="lg" label="Loading the player" />
        </div>
      )}
    </div>
  );
};
