import type {DataComponentProps} from '@/types';
import {Button} from './Button';

interface TabButtonProps extends DataComponentProps<typeof Button> {
  active: boolean;
}

export const TabButton = ({active, children, ...rest}: TabButtonProps) => {
  return (
    <Button
      className="flex gap-1 items-center"
      intent={active ? 'primary' : 'secondary'}
      type="button"
      {...rest}>
      {children}
    </Button>
  );
};
