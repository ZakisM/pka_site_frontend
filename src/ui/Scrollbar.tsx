import {
  type ReactElement,
  type RefObject,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { VList, type VListHandle } from "virtua";
import { useOverlayScrollbars } from "overlayscrollbars-react";

const SCROLLBAR_OPTIONS = {
  scrollbars: { theme: "os-theme-light", autoHide: "move" },
} as const;

// OverlayScrollbars takes over the first child as its viewport, so whatever is
// Passed in must be a single scrollable element.
const useOverlayViewport = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [initialize, instance] = useOverlayScrollbars({
    defer: false,
    options: SCROLLBAR_OPTIONS,
  });

  useLayoutEffect(() => {
    if (hostRef.current) {
      initialize({
        target: hostRef.current,
        elements: { viewport: hostRef.current.firstElementChild as HTMLElement },
      });
    }

    return () => instance()?.destroy();
  }, [initialize, instance]);

  return hostRef;
};

export const Scrollbar = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const hostRef = useOverlayViewport();

  return (
    <div ref={hostRef} className={className} data-overlayscrollbars-initialize="">
      {children}
    </div>
  );
};

// Scroll offsets by key, surviving a list being hidden or swapped out. A
// Module-level map rather than state: nothing re-renders when it changes.
const scrollOffsets = new Map<string, number>();

interface VirtualListProps<T> {
  data: T[];
  children: (item: T, index: number) => ReactElement;
  listRef?: RefObject<VListHandle | null>;
  itemSize?: number;
  className?: string;
  // Remembers where this list was scrolled to. Restored when the list is
  // Shown again and saved when it goes away — which for a list inside
  // <Activity> means on reveal and hide, since that destroys and re-runs
  // Effects. Hiding sets display:none, and that alone resets scrollTop.
  scrollKey?: string;
}

/**
 * A virtualised list inside an overlay scrollbar.
 *
 * Takes the data plus a render function rather than ready-made children: an
 * Unfiltered search is ~35k rows, and building an element for every one costs
 * Hundreds of milliseconds per list change even though only the dozen on
 * Screen are ever mounted.
 */
export const VirtualList = <T,>({
  data,
  children,
  listRef,
  itemSize,
  className = "",
  scrollKey,
}: VirtualListProps<T>) => {
  const hostRef = useOverlayViewport();
  const innerRef = useRef<VListHandle | null>(null);

  useImperativeHandle(listRef, () => innerRef.current as VListHandle, []);

  // Restore on mount, and on reveal when this sits inside <Activity>. The
  // Offset is recorded as it changes (below) rather than on teardown: hiding
  // Applies display:none, which resets scrollTop before any cleanup could
  // Read it.
  useLayoutEffect(() => {
    const saved = scrollKey && scrollOffsets.get(scrollKey);

    if (saved) {
      innerRef.current?.scrollTo(saved);
    }
  }, [scrollKey]);

  return (
    <div ref={hostRef} className={className} data-overlayscrollbars-initialize="">
      <VList
        ref={innerRef}
        data={data}
        itemSize={itemSize}
        onScroll={(offset) => {
          if (scrollKey) {
            scrollOffsets.set(scrollKey, offset);
          }
        }}
      >
        {children}
      </VList>
    </div>
  );
};
