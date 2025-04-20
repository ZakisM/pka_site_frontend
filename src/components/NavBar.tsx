import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {Link} from '@tanstack/react-router';
import {Shuffle} from 'lucide-react';
import {useState} from 'react';
import {NavSearch} from './NavSearch.tsx';
import {Tooltip, TooltipContent, TooltipTrigger} from './Tooltip.tsx';

export const NavBar = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header>
      <nav className="grid h-nav-height grid-cols-3 items-center border-zinc-900 border-b bg-night px-6">
        <h1 className="select-none font-raleway font-extrabold text-primary text-xl uppercase">
          PKA Index
        </h1>
        <NavSearch searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
        <div className="flex justify-end gap-4">
          <button
            className="sm:hidden hover:cursor-pointer inline-flex"
            type="button"
            onClick={() => setSearchOpen(true)}>
            <Tooltip>
              <TooltipTrigger>
                <MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-zinc-300 hover:cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>
          </button>
          <Link
            className="inline-flex"
            type="button"
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
