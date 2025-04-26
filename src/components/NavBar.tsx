import {Link} from '@tanstack/react-router';
import {useAtom} from 'jotai';
import {Search, Shuffle} from 'lucide-react';
import {searchOpenAtom} from '@/atoms/searchAtoms.ts';
import {NavSearch} from './NavSearch.tsx';
import {Tooltip, TooltipContent, TooltipTrigger} from './Tooltip.tsx';

export const NavBar = () => {
  const [_, setSearchOpen] = useAtom(searchOpenAtom);

  return (
    <header>
      <nav className="grid h-nav-height grid-cols-3 items-center border-zinc-900 border-b bg-night px-6">
        <h1 className="select-none font-raleway font-extrabold text-primary text-xl uppercase">
          PKA Index
        </h1>
        <NavSearch />
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
            to={'/watch/$episodeId'}
            params={{episodeId: 'random'}}>
            <Tooltip>
              <TooltipTrigger>
                <Shuffle className="h-5 w-5 stroke-2 text-zinc-300 hover:cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>Random</TooltipContent>
            </Tooltip>
          </Link>
        </div>
      </nav>
    </header>
  );
};
