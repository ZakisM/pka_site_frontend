import {useAtom} from 'jotai';
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentProps,
  useOverlayScrollbars,
} from 'overlayscrollbars-react';
import {
  type RefObject,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import {VList, type VListHandle} from 'virtua';
import {scrollbarStateAtom} from '@/atoms/scrollbarAtoms';

interface ScrollbarProps extends OverlayScrollbarsComponentProps {
  children: React.ReactNode;
}

export const Scrollbar = ({children, ...rest}: ScrollbarProps) => (
  <OverlayScrollbarsComponent
    defer
    options={{
      scrollbars: {
        theme: 'os-theme-light',
        autoHide: 'move',
      },
    }}
    {...rest}>
    {children}
  </OverlayScrollbarsComponent>
);

interface VirtualizedScrollbarProps extends ScrollbarProps {
  vScrollbarRef: RefObject<VListHandle | null>;
  scrollKey: string;
}

export const VirtualizedScrollbar = ({
  vScrollbarRef,
  scrollKey,
  children,
  ...rest
}: VirtualizedScrollbarProps) => {
  const vListRef = useRef<VListHandle | null>(null);
  const osRef = useRef<HTMLDivElement>(null);

  const [scrollbarState, setScrollbarState] = useAtom(scrollbarStateAtom);

  const [initialize] = useOverlayScrollbars({
    defer: false,
    options: {
      scrollbars: {
        theme: 'os-theme-light',
        autoHide: 'move',
      },
    },
  });

  useImperativeHandle(vScrollbarRef, () => {
    return vListRef.current as VListHandle;
  }, []);

  useLayoutEffect(() => {
    if (osRef.current) {
      initialize({
        target: osRef.current,
        elements: {
          viewport: osRef.current.firstElementChild as HTMLElement,
        },
      });
    }
  }, [initialize]);

  useLayoutEffect(() => {
    if (vListRef.current) {
      vListRef.current.scrollTo(scrollbarState[scrollKey]?.offset);
    }

    return () => {
      setScrollbarState((prev) => {
        if (vListRef.current) {
          return {
            ...prev,
            [scrollKey]: {
              offset: vListRef.current.scrollOffset,
              cache: vListRef.current.cache,
            },
          };
        }

        return prev;
      });
    };
  }, []);

  return (
    <div {...rest} data-overlayscrollbars-initialize="" ref={osRef}>
      <VList
        ref={vListRef}
        cache={scrollbarState[scrollKey]?.cache}
        itemSize={98}>
        {children}
      </VList>
    </div>
  );
};
