import { type SearchRow, searchOpenAtom } from "./searchState";
import { startIntentAtom } from "@/player/playerState";
import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

/**
 * Everything a result can do. Each of these records where to start in state
 * And navigates to a clean URL — the moment lives in the app, not the address
 * Bar, so going back later resumes rather than replaying.
 */
export const useSearchActions = () => {
  const navigate = useNavigate();
  const setSearchOpen = useSetAtom(searchOpenAtom);
  const setStartIntent = useSetAtom(startIntentAtom);

  const openEpisodeAt = useCallback(
    (episodeNumber: number, seconds?: number) => {
      if (seconds !== undefined) {
        setStartIntent({ episodeNumber, seconds, requestedAt: Date.now() });
      }

      navigate({
        to: "/watch/$episodeId",
        params: { episodeId: String(episodeNumber) },
      });
      setSearchOpen(false);
    },
    [navigate, setSearchOpen, setStartIntent],
  );

  return {
    // A result row: play from its moment, or from the top with shift held.
    playRow: useCallback(
      (row: SearchRow, fromStart = false) =>
        openEpisodeAt(row.episodeNumber, fromStart ? undefined : row.timestamp),
      [openEpisodeAt],
    ),
    // Any row of the preview panel's timeline.
    playMoment: openEpisodeAt,
    randomMoment: useCallback(() => {
      navigate({ to: "/watch/$episodeId", params: { episodeId: "random-event" } });
      setSearchOpen(false);
    }, [navigate, setSearchOpen]),
  };
};
