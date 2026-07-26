import { Dices, Search, Shuffle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { Wordmark, WordmarkIcon } from "./Wordmark";
import { Link } from "@tanstack/react-router";
import { SearchTakeover } from "@/search/SearchTakeover";
import { searchOpenAtom } from "@/search/searchState";
import { useSetAtom } from "jotai";

// Radix tooltips also open on focus; the native dialog returns focus to its
// Trigger on close, which on touch devices left the tooltip stuck open.
const preventTooltipFocusOpen = (event: React.FocusEvent) =>
  event.preventDefault();

// Every cell is full height and separated by a vertical hairline — the
// Dividers are the layout, so there is no padding between cells.
const iconCellStyles =
  "flex w-[49px] shrink-0 items-center justify-center border-l border-hairline text-muted transition-colors duration-150 hover:bg-cell-hover hover:text-ink desktop:w-[57px]";

export const AppHeader = () => {
  const setSearchOpen = useSetAtom(searchOpenAtom);

  return (
    <>
      <header className="flex h-[53px] shrink-0 items-stretch border-b border-hairline desktop:h-[57px]">
        {/* Desktop clears the lockup's 120px minimum; the mobile cell does
            not, so it shows the square IX mark instead. */}
        <Link
          aria-label="PKA Index — latest episode"
          className="flex shrink-0 items-center border-r border-hairline px-[13px] desktop:px-5"
          to="/watch/$episodeId"
          params={{ episodeId: "latest" }}
        >
          <WordmarkIcon className="size-[26px] text-[13px] desktop:hidden" />
          <Wordmark className="h-[28px] text-[19px] mobile:hidden" />
        </Link>
        <button
          type="button"
          aria-label="Search"
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-[9px] px-[13px] text-left text-[13px] text-muted transition-colors duration-150 hover:bg-cell-hover hover:text-ink desktop:gap-2.5 desktop:border-r desktop:border-hairline desktop:px-5 desktop:text-[14px]"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-[17px] shrink-0 stroke-[2.2] desktop:size-4" />
          <span className="truncate">Search every episode and moment</span>
          <kbd className="ml-auto shrink-0 border border-control px-1.5 py-0.5 font-sans text-[11px] tabular-nums text-dimmer mobile:hidden">
            ⌘K
          </kbd>
        </button>
        {/* Icon-only cells: the label lives in the tooltip and aria-label. */}
        <Tooltip>
          <TooltipTrigger onFocus={preventTooltipFocusOpen} asChild>
            <Link
              aria-label="Random episode"
              className={iconCellStyles}
              to="/watch/$episodeId"
              params={{ episodeId: "random" }}
            >
              <Shuffle className="size-[17px] stroke-[2.2]" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom">Random episode</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger onFocus={preventTooltipFocusOpen} asChild>
            <Link
              aria-label="Random moment"
              className={iconCellStyles}
              to="/watch/$episodeId"
              params={{ episodeId: "random-event" }}
            >
              <Dices className="size-[17px] stroke-[2.2]" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom">Random moment</TooltipContent>
        </Tooltip>
      </header>

      <SearchTakeover />
    </>
  );
};
