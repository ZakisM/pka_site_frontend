import { Skeleton } from "@/ui/Loaders";

// Uneven widths so a column of rows does not read as a pattern.
const RAIL_ROWS = ["78%", "94%", "62%", "88%", "71%", "96%", "58%", "83%", "74%", "90%"];

/**
 * The watch screen's shape while the first episode loads: player box, episode
 * Bar and rail all hold their real positions, so nothing moves when it lands.
 */
export const WatchSkeleton = () => (
  <div className="desktop:grid desktop:grid-cols-[minmax(0,1fr)_380px] desktop:grid-rows-[auto_1fr]">
    <main className="min-w-0 px-8 pt-6 mobile:p-0">
      <div className="watch-width mx-auto">
        <div className="aspect-video w-full bg-black mobile:min-h-[200px]" />
        <div className="mt-4 flex flex-col gap-2.5 mobile:mx-4 mobile:mt-3">
          <Skeleton className="h-3.5 w-40" soft />
          <Skeleton className="h-6 w-[min(460px,80%)]" delay={0.08} />
        </div>
      </div>
    </main>
    <aside className="flex flex-col desktop:sticky desktop:top-(--header-h) desktop:h-[calc(100dvh-var(--header-h))] desktop:border-l desktop:border-line mobile:mt-6">
      <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 mobile:px-4">
        <h2 className="text-[15px] font-semibold">Moments</h2>
        <Skeleton className="ml-auto h-8 w-44" soft />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden border-t border-line py-2">
        {RAIL_ROWS.map((width, index) => (
          <div key={width} className="grid grid-cols-[56px_1fr] gap-3 px-5 py-2.5 mobile:px-4">
            <Skeleton className="mt-px h-3 w-10" delay={index * 0.08} />
            <span className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5" style={{ width }} delay={index * 0.08} />
              <Skeleton className="h-3.5 w-1/2" soft delay={index * 0.08} />
            </span>
          </div>
        ))}
      </div>
      </div>
    </aside>
  </div>
);
