import { useEffect, useState } from "react";
import { smoothScroll } from "@/lib/motion";

// The archive grid's own measurements (`gridStyles`: columns of at least
// 260px, 20px apart), so shelf cards line up with the columns below them.
const MIN_CARD = 260;
const GAP = 20;

/**
 * A row that scrolls sideways. On desktops each card is exactly one archive
 * Column wide; `edges` says whether there is more to either side, for the
 * Paging buttons, and `page` scrolls by a screenful.
 */
export const useShelf = (itemCount: number) => {
  const [row, setRow] = useState<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  useEffect(() => {
    if (!row) {
      return;
    }

    const update = () => {
      const width = row.clientWidth;
      const columns = Math.max(1, Math.floor((width + GAP) / (MIN_CARD + GAP)));

      row.style.setProperty("--card-w", `${(width - (columns - 1) * GAP) / columns}px`);
      setEdges({
        atStart: row.scrollLeft <= 1,
        atEnd: row.scrollLeft + width >= row.scrollWidth - 1,
      });
    };
    const observer = new ResizeObserver(update);

    update();
    observer.observe(row);
    row.addEventListener("scroll", update, { passive: true });

    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", update);
    };
  }, [row, itemCount]);

  const page = (direction: 1 | -1) => {
    row?.scrollBy({ left: direction * (row.clientWidth + GAP), behavior: smoothScroll() });
  };

  return { rowRef: setRow, edges, page };
};
