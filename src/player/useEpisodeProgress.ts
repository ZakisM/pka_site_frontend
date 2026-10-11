import { usePosition } from "./watchHistory";
import { watchProgress } from "@/lib/progress";

/** How far the viewer got through an episode, if they started it. */
export const useEpisodeProgress = ({ videoId, lengthSeconds }: { videoId: string; lengthSeconds: number }) =>
  watchProgress(usePosition(videoId), lengthSeconds);
