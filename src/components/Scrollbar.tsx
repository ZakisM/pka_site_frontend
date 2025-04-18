import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentProps,
} from 'overlayscrollbars-react';
import type {ReactNode} from 'react';

interface ScrollbarProps extends OverlayScrollbarsComponentProps {
  children: ReactNode;
}

export const Scrollbar = (props: ScrollbarProps) => {
  const {children, ...rest} = props;

  return (
    <OverlayScrollbarsComponent
      defer
      options={{
        scrollbars: {
          theme: 'os-theme-light',
          autoHide: 'move',
          clickScroll: true,
        },
      }}
      {...rest}>
      {children}
    </OverlayScrollbarsComponent>
  );
};
