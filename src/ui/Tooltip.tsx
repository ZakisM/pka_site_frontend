import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = ({
  ...rest
}: React.ComponentProps<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    {/* Flat and hard-edged like every other surface: no radius, no shadow,
        no scale — just a short fade. */}
    <TooltipPrimitive.Content
      sideOffset={8}
      className="pka-fade-in z-50 border border-control bg-row-hover px-2.5 py-1.5 text-[12px] text-ink"
      {...rest}
    />
  </TooltipPrimitive.Portal>
);

const Tooltip = ({
  children,
}: React.ComponentProps<typeof TooltipPrimitive.Root>) => (
  <TooltipPrimitive.Provider delayDuration={200}>
    <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);

export { Tooltip, TooltipTrigger, TooltipContent };
