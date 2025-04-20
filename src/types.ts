export type DataComponentProps<T extends React.ElementType<any>> =
  React.ComponentPropsWithoutRef<T> & {
    [key: `data-${string}`]: string | undefined;
  };
