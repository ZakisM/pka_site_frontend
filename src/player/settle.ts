import { PlayerState } from "@/lib/youtube";

// How far the reported position may sit from the requested one and count as
// There.
const TOLERANCE_SECONDS = 2;
// Playing polls in a row at the position before it counts as reached: right
// After a switch the cache can still report a moment of the old clock.
const CONFIRMATIONS = 2;
// Long enough for a seek to land and the cache to catch up.
const RESEEK_MS = 1000;
// After playing this long away from the position, the viewer has probably
// Moved it themselves: believe the player.
const GIVE_UP_MS = 10_000;

/** A position asked for and not yet seen playing. */
export interface Pending {
  seconds: number;
  seekedAt: number;
  playingAwaySince: number | undefined;
  confirmations: number;
}

export const pendingAt = (seconds: number, at: number): Pending => ({
  seconds,
  seekedAt: at,
  playingAwaySince: undefined,
  confirmations: 0,
});

export interface Report {
  state: number;
  time: number;
  at: number;
}

export type Verdict = "reached" | "abandon" | "seek" | "wait";

/**
 * What to do about a pending position, given what the player reports. Only a
 * Playing or paused player is judged: while it loads, buffers or sits cued,
 * Its clock means little and a seek is the kind that gets lost. So a position
 * Is never given up on before the video has actually played away from it.
 */
export const settle = (target: Pending, { state, time, at }: Report): Verdict => {
  if (state === PlayerState.ENDED) {
    return "abandon";
  }

  if (state !== PlayerState.PLAYING && state !== PlayerState.PAUSED) {
    target.confirmations = 0;

    return "wait";
  }

  if (Math.abs(time - target.seconds) <= TOLERANCE_SECONDS) {
    if (state === PlayerState.PLAYING) {
      target.confirmations += 1;
    }

    return target.confirmations >= CONFIRMATIONS ? "reached" : "wait";
  }

  target.confirmations = 0;

  if (state === PlayerState.PLAYING) {
    target.playingAwaySince ??= at;

    if (at - target.playingAwaySince > GIVE_UP_MS) {
      return "abandon";
    }
  }

  // Seeking a paused video leaves it paused, so this is safe either way.
  return at - target.seekedAt >= RESEEK_MS ? "seek" : "wait";
};
