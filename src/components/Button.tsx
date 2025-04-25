import type {DataComponentProps} from '@/types';
import {cva, type VariantProps} from 'class-variance-authority';

export const buttonStyles = cva(
  'py-1.25 px-3 tracking-wider font-[425] text-white text-xs uppercase hover:cursor-pointer rounded-[10px]',
  {
    variants: {
      intent: {
        primary: ['bg-primary/75'],
        secondary: ['bg-zinc-800'],
      },
    },
    defaultVariants: {
      intent: 'primary',
    },
  },
);

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;

interface ButtonProps extends DataComponentProps<'button'>, ButtonStyleProps {}

export const Button = ({intent, className, ...rest}: ButtonProps) => {
  return <button {...rest} className={buttonStyles({intent, className})} />;
};
