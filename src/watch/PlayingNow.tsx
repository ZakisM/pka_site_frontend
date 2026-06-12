import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/Tooltip";
import { Link2 } from "lucide-react";
import type { PkaEvent } from "@/lib/api";
import { formatTimestamp } from "@/lib/time";
import { useState } from "react";

const COPIED_FEEDBACK_MS = 2000;

interface PlayingNowProps {
  event: PkaEvent | undefined;
  nextEvent: PkaEvent | undefined;
  episodeNumber: number;
  position: number;
}

/** Answers "where am I, and what's next" — the band directly under the player. */
export const PlayingNow = ({
  event,
  nextEvent,
  episodeNumber,
  position,
}: PlayingNowProps) => {
  const [copied, setCopied] = useState(false);

  const shareFrom = Math.floor(position);
  const shareLabel = `Share from ${formatTimestamp(shareFrom)}`;

  // The URL is the one place a timestamp still belongs: for other people.
  const copyShareLink = async () => {
    const url = new URL(`/watch/${episodeNumber}`, globalThis.location.origin);

    url.searchParams.set("timestamp", String(shareFrom));

    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard permission denied — nothing useful to fall back to.
    }
  };

  return (
    <section className="flex shrink-0 items-start gap-3 border-b border-hairline px-4 pt-3 pb-3 desktop:items-center desktop:gap-7 desktop:px-6 desktop:pt-5 desktop:pb-[22px]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 pb-[5px] desktop:gap-2.5 desktop:pb-[7px]">
          <span aria-hidden className="block size-[5px] bg-primary desktop:size-1.5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary desktop:text-[11px]">
            Playing now
          </span>
          <span className="whitespace-nowrap text-[11px] tabular-nums text-dimmer desktop:text-[12px]">
            {event &&
              `${formatTimestamp(event.timestamp)} – ${formatTimestamp(
                event.timestamp + event.lengthSeconds,
              )}`}
          </span>
        </div>
        <h2 className="font-raleway text-[19px]/[1.2] font-bold text-pretty desktop:text-[29px]/[1.12] desktop:tracking-[-0.01em]">
          {event?.description}
        </h2>
        {nextEvent && (
          <p className="truncate pt-[5px] text-[12px] text-muted desktop:pt-2.5 desktop:text-[13px]">
            Up next <span className="text-secondary">{nextEvent.description}</span>
          </p>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger
          aria-label={shareLabel}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center border border-control text-muted transition-colors duration-150 hover:bg-row-hover hover:text-ink"
          onClick={copyShareLink}
        >
          <Link2 className="size-[17px] stroke-2" />
        </TooltipTrigger>
        <TooltipContent side="left">
          {copied ? "Link copied" : shareLabel}
        </TooltipContent>
      </Tooltip>
    </section>
  );
};
