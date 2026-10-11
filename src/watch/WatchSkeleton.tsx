import { Skeleton } from "@/ui/Loaders";

// Uneven widths so a column of rows does not read as a pattern.
const RAIL_ROWS = ["78%", "94%", "62%", "88%", "71%", "96%", "58%", "83%", "74%", "90%"];

/**
 * The watch screen's shape while the first episode loads: player box, episode
 * Bar and rail all hold their real positions, so nothing moves when it lands.
 */
export const WatchSkeleton = () => (
  <div className="desktop:grid desktop:grid-cols-[minmax(0,1fr)_380px] max-[1100px]:desktop:grid-cols-[minmax(0,1fr)_330px]">
    <main className="min-w-0 px-8 pt-6 pb-14 max-[1100px]:px-5 max-[1100px]:pt-5 mobile:p-0 mobile:pb-1">
      <div className="watch-screen mx-auto">
        <div className="aspect-video w-full bg-black mobile:min-h-[200px]" />
        <div className="mt-5 flex flex-col gap-3 mobile:mx-4 mobile:mt-4">
          <Skeleton className="h-6 w-[min(460px,80%)]" />
          <Skeleton className="h-3.5 w-40" soft delay={0.08} />
        </div>
      </div>
    </main>
    <aside className="flex flex-col desktop:sticky desktop:top-(--header-h) desktop:h-[calc(100dvh-var(--header-h))] desktop:border-l desktop:border-line mobile:mt-4 mobile:border-t mobile:border-line">
      <div className="flex flex-col gap-3 px-5 pt-5 pb-3.5 mobile:px-4">
        <h2 className="text-[15px] font-semibold">Moments</h2>
        <Skeleton className="h-[34px] w-full" soft />
      </div>
      <div className="overflow-hidden border-t border-line py-2">
        {RAIL_ROWS.map((width, index) => (
          <div key={width} className="grid grid-cols-[52px_1fr] gap-3 px-5 py-2.5 mobile:px-4">
            <span className="flex flex-col gap-1.5 pt-px">
              <Skeleton className="h-3 w-10" delay={index * 0.08} />
              <Skeleton className="h-2.5 w-6" soft delay={index * 0.08} />
            </span>
            <span className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5" style={{ width }} delay={index * 0.08} />
              <Skeleton className="h-3.5 w-1/2" soft delay={index * 0.08} />
            </span>
          </div>
        ))}
      </div>
    </aside>
  </div>
);
