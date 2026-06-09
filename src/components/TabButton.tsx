import type { DataComponentProps } from "@/types";
import clsx from "clsx";

interface TabButtonProps extends DataComponentProps<"button"> {
  active: boolean;
}

export const TabButton = ({ active, children, ...rest }: TabButtonProps) => 
  (
    <button
      type="button"
      className={clsx(
        "relative pt-1 pb-2.5 text-[13px] font-medium transition-colors hover:cursor-pointer",
        active ? "text-white" : "text-zinc-500 hover:text-zinc-300",
      )}
      {...rest}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
      )}
    </button>
  )
;
