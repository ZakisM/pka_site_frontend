// Episode titles changed format many times over fifteen years — "Painkiller
// Already 45", "PKA 279 w PhillyD Puberty, UFC 200…", "PKA 825 W/ Harley:
// Redemption Of Wings", "Woody Snaps? : PKA 719 W/ Harley". Guests can't be
// Extracted reliably, so titles are shown as written with one exception: the
// Episode number is already on screen, so a leading "PKA 825" goes, and a
// Trailing ": PKA 719 W/ Harley" keeps its guest but loses the number.

const LEADING_NUMBER = /^(?:PKA|Painkiller(?: Already)?)\s*(?:Ep\.?|Episode)?\s*#?\d+(?:\.\d+)?\s*(?:[-:|–—]\s*)?/iu;
const TRAILING_NUMBER = /^(?<before>.+?)\s*[:|]?\s*PKA\s*\d+\s*(?<after>.*)$/u;

export const displayTitle = (raw: string) => {
  const collapsed = raw.replaceAll(/\s+/gu, " ").trim();
  let title = collapsed.replace(LEADING_NUMBER, "");
  const { before, after } = TRAILING_NUMBER.exec(title)?.groups ?? {};

  if (before !== undefined) {
    title = `${before.replace(/[\s:|]+$/u, "")}${after === undefined || after === "" ? "" : ` ${after}`}`;
  }

  // Untitled early episodes are nothing but the number; keep them as written.
  return title.trim() || collapsed;
};
