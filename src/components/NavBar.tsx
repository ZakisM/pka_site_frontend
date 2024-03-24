import {NavSearch} from './NavSearch.tsx';

export const NavBar = () => {
  return (
    <header>
      <nav className="grid h-nav-height grid-cols-3 items-center border-zinc-900 border-b bg-zinc-950 px-4">
        <h1 className="select-none font-raleway text-red-600 text-xl uppercase">
          PKA Index
        </h1>
        <NavSearch />
      </nav>
    </header>
  );
};
