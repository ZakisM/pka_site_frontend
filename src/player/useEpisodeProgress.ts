import { positionAtom } from "./playerState";
import { useAtomValue } from "jotai";
import { watchProgress } from "@/lib/progress";

/** How far the viewer got through an episode, if they started it. */
export const useEpisodeProgress = ({ videoId, lengthSeconds }: { videoId: string; lengthSeconds: number }) =>
  watchProgress(useAtomValue(positionAtom(videoId)), lengthSeconds);
