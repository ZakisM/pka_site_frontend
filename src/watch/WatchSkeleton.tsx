import { Skeleton } from "@/ui/Loaders";

// Uneven widths so a column of rows does not read as a pattern.
const RAIL_ROWS = ["78%", "94%", "62%", "88%", "71%", "96%", "58%", "83%", "74%", "90%"];

/**
 * The watch screen's shape while the first episode loads: the player box, the
 * Playing-now band and the rail all hold their real positions, so nothing
 * Moves when the data lands.
 */
export const WatchSkeleton = () => (
  <div className="flex h-full min-h-0 mobile:flex-col">
    <main className="flex min-h-0 min-w-0 flex-1 flex-col mobile:flex-none">
      <div className="min-w-0 bg-black mobile:aspect-video mobile:min-h-[200px] mobile:shrink-0 desktop:min-h-[300px] desktop:flex-1" />

      <section className="flex shrink-0 items-start gap-3 border-b border-hairline px-4 pt-3 pb-3 desktop:items-center desktop:gap-7 desktop:px-6 desktop:pt-5 desktop:pb-[22px]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 pb-[5px] desktop:gap-2.5 desktop:pb-[7px]">
            <Skeleton className="h-[11px] w-[92px]" />
            <Skeleton className="h-[11px] w-[86px]" soft />
          </div>
          <Skeleton className="h-[26px] w-[62%] desktop:h-8" delay={0.08} />
          <div className="pt-[5px] desktop:pt-2.5">
            <Skeleton className="h-[13px] w-[38%]" soft delay={0.16} />
          </div>
        </div>
        <Skeleton className="size-11 shrink-0" delay={0.08} />
      </section>

      <section className="flex shrink-0 items-center bg-raised mobile:hidden">
        <div className="flex h-[50px] items-center border-r border-hairline px-5">
          <Skeleton className="h-[21px] w-[54px]" />
        </div>
        <div className="min-w-0 flex-1 px-5">
          <Skeleton className="h-[14px] w-[46%]" soft delay={0.08} />
        </div>
        <div className="flex h-[50px]">
          <span className="flex items-center border-l border-hairline px-[18px]">
            <Skeleton className="h-[12px] w-[52px]" soft delay={0.16} />
          </span>
          <span className="flex items-center border-l border-hairline px-[18px]">
            <Skeleton className="h-[12px] w-[128px]" soft delay={0.24} />
          </span>
        </div>
      </section>
    </main>

    <aside className="flex min-h-0 flex-col bg-raised mobile:flex-1 desktop:w-[381px] desktop:shrink-0 desktop:border-l desktop:border-hairline">
      <div className="flex h-[39px] shrink-0 items-center justify-between border-b border-hairline px-4 desktop:h-[45px] desktop:px-[18px]">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink mobile:tracking-[0.16em]">
          Moments
        </span>
        <Skeleton className="h-[12px] w-[72px]" soft />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {RAIL_ROWS.map((width, index) => (
          <div
            key={width}
            className="flex gap-3.5 border-b border-hairline-soft px-4 py-3.5 desktop:px-[18px] desktop:py-[13px]"
          >
            <Skeleton className="mt-px h-[12px] w-[50px] shrink-0" delay={index * 0.08} />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <Skeleton className="h-[14px]" style={{ width }} delay={index * 0.08} />
              <Skeleton className="h-[11px] w-[42px]" soft delay={index * 0.08} />
            </span>
          </div>
        ))}
      </div>
    </aside>
  </div>
);
