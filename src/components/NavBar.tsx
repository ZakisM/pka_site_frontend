import { Dices, Search, Shuffle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip.tsx";
import { Link } from "@tanstack/react-router";
import { NavSearch } from "./NavSearch.tsx";
import { searchOpenAtom } from "@/atoms/searchAtoms.ts";
import { useSetAtom } from "jotai";

const railButtonStyles =
  "flex size-10 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-white/5 hover:text-white hover:cursor-pointer";

export const NavBar = () => {
  const setSearchOpen = useSetAtom(searchOpenAtom);

  return (
    <>
      {/* Desktop: icon rail */}
      <aside className="flex w-16 shrink-0 flex-col items-center gap-1.5 border-r border-white/5 bg-night/60 py-4 max-lg:hidden">
        <Link
          aria-label="PKA Index — latest episode"
          className="mb-5 transition-opacity hover:opacity-80"
          to="/watch/$episodeId"
          params={{ episodeId: "latest" }}
        >
          <img alt="PKA Index" className="size-9" src="/favicon.svg" />
        </Link>
        <Tooltip>
          <TooltipTrigger
            className={railButtonStyles}
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5 stroke-2" />
          </TooltipTrigger>
          <TooltipContent side="right">
            Search
            <kbd className="ml-2 rounded bg-white/10 px-1 py-0.5 text-[10px] text-zinc-400">
              ⌘K
            </kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className={railButtonStyles}
              to="/watch/$episodeId"
              params={{ episodeId: "random" }}
            >
              <Shuffle className="size-5 stroke-2" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Random Episode</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className={railButtonStyles}
              to="/watch/$episodeId"
              params={{ episodeId: "random-event" }}
            >
              <Dices className="size-5 stroke-2" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Random Event</TooltipContent>
        </Tooltip>
      </aside>

      {/* Mobile: top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-night/60 px-4 lg:hidden">
        <Link
          className="flex select-none items-center gap-2.5"
          to="/watch/$episodeId"
          params={{ episodeId: "latest" }}
        >
          <img alt="" className="size-7" src="/favicon.svg" />
          <span className="flex items-baseline gap-1.5 font-raleway font-extrabold uppercase leading-none tracking-wide">
            <span>PKA</span>
            <span className="text-primary">Index</span>
          </span>
        </Link>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger
              className={railButtonStyles}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5 stroke-2" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Search</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={railButtonStyles}
                to="/watch/$episodeId"
                params={{ episodeId: "random" }}
              >
                <Shuffle className="size-5 stroke-2" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Random Episode</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={railButtonStyles}
                to="/watch/$episodeId"
                params={{ episodeId: "random-event" }}
              >
                <Dices className="size-5 stroke-2" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Random Event</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <NavSearch />
    </>
  );
};
