import { type VariantProps, cva } from "class-variance-authority";
import type { DataComponentProps } from "@/types";
import { twMerge } from "tailwind-merge";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:cursor-pointer",
  {
    variants: {
      intent: {
        primary: ["bg-primary/90 text-white hover:bg-primary"],
        secondary: [
          "bg-white/5 text-zinc-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white",
        ],
      },
    },
    defaultVariants: {
      intent: "primary",
    },
  },
);

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;

interface ButtonProps extends DataComponentProps<"button">, ButtonStyleProps {}

export const Button = ({ intent, className, ...rest }: ButtonProps) => 
  (
    <button
      type="button"
      {...rest}
      className={twMerge(buttonStyles({ intent, className }))}
    />
  )
;
