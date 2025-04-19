import {NavSearch} from './NavSearch.tsx';

export const NavBar = () => {
  return (
    <header>
      <nav className="grid h-nav-height grid-cols-3 items-center border-zinc-900 border-b bg-night px-4">
        <h1 className="select-none font-raleway font-extrabold text-primary text-xl uppercase">
          PKA Index
        </h1>
        <NavSearch />
      </nav>
    </header>
  );
};
