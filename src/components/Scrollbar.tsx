import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentProps,
} from 'overlayscrollbars-react';

interface ScrollbarProps extends OverlayScrollbarsComponentProps {
  children: React.ReactNode;
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
        },
      }}
      {...rest}>
      {children}
    </OverlayScrollbarsComponent>
  );
};
