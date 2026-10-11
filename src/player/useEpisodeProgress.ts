import { atom, useAtomValue } from "jotai";
import { positionAtom, recentEpisodesAtom } from "./playerState";
import { watchProgress } from "@/lib/progress";

const noPositionAtom = atom(0);

interface EpisodeRef {
  episodeNumber: number;
  lengthSeconds: number;
  videoId?: string;
}

/**
 * How far the viewer got through an episode, if they started it. Positions are
 * Stored per video id; list endpoints may not carry one, so fall back to the
 * Id remembered when the episode was last opened.
 */
export const useEpisodeProgress = ({ episodeNumber, lengthSeconds, videoId }: EpisodeRef) => {
  const recent = useAtomValue(recentEpisodesAtom);
  const id = videoId ?? recent.find((entry) => entry.episodeNumber === episodeNumber)?.videoId;
  const position = useAtomValue(id ? positionAtom(id) : noPositionAtom);

  return watchProgress(position, lengthSeconds);
};
