import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type {DataComponentProps} from '@/types';

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = ({
  ...rest
}: DataComponentProps<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      sideOffset={8}
      className="z-50 overflow-hidden rounded-lg bg-zinc-800/90 px-3 py-1.5 text-xs tracking-wider font-[425] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]"
      {...rest}
    />
  </TooltipPrimitive.Portal>
);

const Tooltip = ({
  ...rest
}: React.ComponentPropsWithoutRef<typeof TooltipRoot>) => (
  <TooltipProvider delayDuration={200}>
    <TooltipRoot {...rest} />
  </TooltipProvider>
);

export {Tooltip, TooltipTrigger, TooltipContent, TooltipProvider};
