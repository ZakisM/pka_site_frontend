import {Dices, Search, Shuffle} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipTrigger} from './Tooltip.tsx';
import {Link} from '@tanstack/react-router';
import {NavSearch} from './NavSearch.tsx';
import {searchOpenAtom} from '@/atoms/searchAtoms.ts';
import {useSetAtom} from 'jotai';

export const NavBar = () => {
  const setSearchOpen = useSetAtom(searchOpenAtom);

  return (
    <header>
      <nav className="grid h-nav-height grid-cols-3 items-center border-zinc-900 border-b bg-night px-6">
        <h1 className="select-none font-raleway font-extrabold text-primary text-xl uppercase">
          PKA Index
        </h1>
        <div>
          <NavSearch className="max-sm:hidden" />
        </div>
        <div className="flex justify-end gap-4">
          <Tooltip>
            <TooltipTrigger
              className="sm:hidden hover:cursor-pointer flex"
              onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5 stroke-2 text-zinc-300 hover:cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>
          <Link
            className="flex"
            to="/watch/$episodeId"
            params={{episodeId: 'random-event'}}>
            <Tooltip>
              <TooltipTrigger>
                <Dices className="h-5 w-5 stroke-2 text-zinc-300 hover:cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>Random Event</TooltipContent>
            </Tooltip>
          </Link>
          <Link
            className="flex"
            to="/watch/$episodeId"
            params={{episodeId: 'random'}}>
            <Tooltip>
              <TooltipTrigger>
                <Shuffle className="h-5 w-5 stroke-2 text-zinc-300 hover:cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>Random Episode</TooltipContent>
            </Tooltip>
          </Link>
        </div>
      </nav>
    </header>
  );
};
