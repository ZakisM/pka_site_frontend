import { format, fromUnixTime } from "date-fns";
import type { PkaEpisodeWithAll } from "@/lib/api";
import { formatTimestamp } from "@/lib/time";

/** Facts only, in fixed cells split by hairlines — no host names. */
export const EpisodeMeta = ({ episode }: { episode: PkaEpisodeWithAll }) => (
  <section className="flex shrink-0 items-center bg-raised mobile:hidden">
    <div className="flex h-[50px] items-center gap-[9px] border-r border-hairline px-5">
      <span className="text-[11px] tracking-[0.14em] text-dimmer">EP</span>
      <span className="font-raleway text-[21px] font-extrabold tabular-nums">
        {episode.episode.number}
      </span>
    </div>
    <div className="min-w-0 flex-1 truncate px-5 text-[14px] text-secondary">
      {episode.youtubeDetails.title}
    </div>
    <div className="flex h-[50px]">
      <span className="flex items-center border-l border-hairline px-[18px] text-[12px] tabular-nums text-muted">
        {formatTimestamp(episode.youtubeDetails.lengthSeconds)}
      </span>
      <span className="flex items-center whitespace-nowrap border-l border-hairline px-[18px] text-[12px] text-muted">
        {format(fromUnixTime(episode.episode.uploadDate), "EEEE do MMMM yyyy")}
      </span>
    </div>
  </section>
);
