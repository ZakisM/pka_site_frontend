// Every timecode in the UI is tabular-nums, so these stay fixed-width.

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// A position in a video: mm:ss until the hour mark, then h:mm:ss.
export const formatTimestamp = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const secs = Math.floor(seconds % 60);
  const mmss = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return hours > 0 ? `${hours}:${mmss}` : mmss;
};

// A length rather than a position ("9m 27s").
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return minutes > 0
    ? `${minutes}m ${String(secs).padStart(2, "0")}s`
    : `${secs}s`;
};

// Hand-rolled rather than date-fns: search rows mount dozens of times per
// Frame while scrolling a virtualised list of 35k results.
export const formatShortDate = (unixSeconds: number) => {
  const date = new Date(unixSeconds * 1000);

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

// The episode number can be fractional for bonus episodes (280.5).
export const formatEpisodeNumber = (episodeNumber: number) =>
  Number(episodeNumber.toFixed(1));
