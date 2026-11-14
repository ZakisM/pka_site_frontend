import { pluralise } from "@/lib/time";

interface SearchStatusProps {
  query: string;
  totals: { totalMoments: number; totalEpisodes: number } | undefined;
  // The rows on screen are still the last query's.
  updating: boolean;
  // Where useHitKeys writes the moment the arrow keys are on.
  pickedRef: React.RefObject<HTMLOutputElement | null>;
}

/**
 * What a screen reader is told while focus stays in the search box, where
 * nothing in the results is read: how many there are as they arrive, and the
 * moment the arrow keys have moved to. Always in the page, since only a change
 * inside an element already there is announced.
 */
export const SearchStatus = ({ query, totals, updating, pickedRef }: SearchStatusProps) => {
  // Empty while results update, so the same count for the next query is said again.
  let found = "";

  if (totals && !updating) {
    found =
      totals.totalEpisodes === 0
        ? `Nothing matches “${query}”.`
        : `${pluralise(totals.totalMoments, "moment")} in ${pluralise(totals.totalEpisodes, "episode")}`;
  }

  return (
    <>
      <output className="sr-only">{found}</output>
      {/* Written by useHitKeys, not React: a keypress re-renders nothing. */}
      <output ref={pickedRef} className="sr-only" />
    </>
  );
};
