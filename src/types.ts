export type DataComponentProps<T extends React.ElementType<any>> =
  React.ComponentProps<T> & {
    [key: `data-${string}`]: string | boolean | undefined;
  };
