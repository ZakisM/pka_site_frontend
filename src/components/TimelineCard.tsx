import {
  playerSeekRequestAtom,
  playerTimestampAtomFamily,
} from "@/atoms/playerAtoms";
import { useAtom, useSetAtom } from "jotai";
import type { DataComponentProps } from "@/types";
import { ProgressBar } from "./ProgressBar";

interface TimelineCardProps extends DataComponentProps<"button"> {
  description: string;
  timestamp: number;
  lengthSeconds: number;
  videoId: string;
}

const formatTimestamp = (timestamp: number) => {
  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor(timestamp / 60) % 60;
  const seconds = timestamp % 60;

  const mmss = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return hours > 0 ? `${hours}:${mmss}` : mmss;
};

export const TimelineCard = ({
  description,
  timestamp,
  lengthSeconds,
  videoId,
  ...rest
}: TimelineCardProps) => {
  const specificTimestampAtom = playerTimestampAtomFamily(videoId);
  const [playerTimestamp] = useAtom(specificTimestampAtom);
  const setSeekRequest = useSetAtom(playerSeekRequestAtom);

  return (
    <button
      type="button"
      className="group relative flex cursor-pointer flex-row gap-3 rounded-lg p-3 text-left text-sm text-zinc-400 transition-colors duration-200 hover:bg-white/[0.04] hover:text-zinc-200 data-[active]:bg-white/[0.04] data-[active]:text-white max-xl:scroll-mt-[calc(56.25vw+12px)]"
      onClick={() => setSeekRequest({ seconds: timestamp, requestedAt: Date.now() })}
      {...rest}
    >
      <time className="w-12 shrink-0 text-right text-xs tabular-nums leading-5 text-zinc-500 transition-colors group-hover:text-zinc-300 group-data-[active]:font-medium group-data-[active]:text-accent">
        {formatTimestamp(timestamp)}
      </time>
      <span
        aria-hidden
        className="relative z-10 mt-1.5 size-2 shrink-0 rounded-full bg-zinc-700 ring-4 ring-night transition-[background-color,transform] group-hover:scale-125 group-hover:bg-zinc-400 group-data-[active]:bg-primary group-data-[active]:shadow-[0_0_10px] group-data-[active]:shadow-primary/80"
      />
      <div className="flex grow flex-col gap-3">
        <div className="line-clamp-3 h-full" title={description}>
          {description}
        </div>
        {rest["data-active"] && (
          <ProgressBar
            progress={Number(
              (((playerTimestamp - timestamp) / lengthSeconds) * 100).toFixed(
                1,
              ),
            )}
          />
        )}
      </div>
    </button>
  );
};


