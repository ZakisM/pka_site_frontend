// Watch progress is the per-video position the player already persists.

// Under this, opening an episode is not "watching" it.
const MIN_SECONDS = 30;
// The last couple of minutes are the outro; reaching them counts as finished.
const OUTRO_SECONDS = 120;

export interface WatchProgress {
  position: number;
  fraction: number;
  finished: boolean;
}

export const watchProgress = (position: number, lengthSeconds: number): WatchProgress | undefined => {
  if (position < MIN_SECONDS || lengthSeconds <= 0) {
    return undefined;
  }

  return {
    position,
    fraction: Math.min(1, position / lengthSeconds),
    finished: position >= lengthSeconds - OUTRO_SECONDS,
  };
};
