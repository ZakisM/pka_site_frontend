import { Activity, useEffect, useRef } from "react";
import { GenericSearchContent, searchConfigMap } from "./SearchContent.tsx";
import { Search, X } from "lucide-react";
import {
  SearchTab,
  debouncedSearchQueryAtom,
  searchCountAtom,
  searchOpenAtom,
  searchQueryAtom,
  searchTabAtom,
} from "@/atoms/searchAtoms.ts";
import { Spinner } from "./Spinner.tsx";
import { TabButton } from "./TabButton.tsx";
import { useAtom } from "jotai";
import { useIsFetching } from "@tanstack/react-query";

const NavSearchPanel = () => {
  const searchFetching = useIsFetching({ queryKey: ["search"] });

  const [searchCount] = useAtom(searchCountAtom);
  const [searchOpen, setSearchOpen] = useAtom(searchOpenAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [searchTab, setSearchTab] = useAtom(searchTabAtom);

  const [debouncedQuery, setDebouncedQuery] = useAtom(debouncedSearchQueryAtom);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);

    return () => clearTimeout(timerId);
  }, [searchQuery, setDebouncedQuery]);

  useEffect(() => {
    if (searchOpen) {
      // The preventScroll option stops mobile browsers panning the page when the
      // Virtual keyboard opens; the input sits at the top of a fullscreen dialog
      // So no scroll is ever needed to reveal it.
      searchInputRef.current?.focus({ preventScroll: true });
    }
  }, [searchOpen, searchTab]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-white/5 px-2.75 pr-4">
        <div className="flex h-8 w-8 items-center justify-center">
          {searchFetching > 0 ? (
            <Spinner className="h-full w-full" />
          ) : (
            <Search className="h-5 w-5 stroke-2 text-zinc-500" />
          )}
        </div>
        <input
          ref={searchInputRef}
          className="w-full bg-transparent py-3.5 pr-4 pl-2.75 text-base text-zinc-100 caret-primary outline-none selection:bg-zinc-700 placeholder:text-zinc-600"
          placeholder="Search..."
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(event.target.value)
          }
          value={searchQuery}
        />
        <button
          className="sm:hidden"
          type="button"
          onClick={() => setSearchOpen(false)}
        >
          <X className="stroke-2 text-zinc-300 hover:cursor-pointer" />
        </button>
      </div>
      <div className="flex items-center gap-6 border-b border-white/5 px-6 pt-2">
        <TabButton
          active={searchTab === SearchTab.EPISODES}
          onClick={() => setSearchTab(SearchTab.EPISODES)}
        >
          Episodes
        </TabButton>
        <TabButton
          active={searchTab === SearchTab.EVENTS}
          onClick={() => setSearchTab(SearchTab.EVENTS)}
        >
          Events
        </TabButton>
      </div>
      <GenericSearchContent
        key={searchTab}
        config={searchConfigMap[searchTab]}
        searchQuery={debouncedQuery}
      />
      <div className="mt-auto flex items-center justify-between border-t border-white/5 px-6 py-3 text-xs text-zinc-500">
        <span className="tabular-nums">{searchCount} results</span>
        <span className="flex items-center gap-4 max-sm:hidden">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-white/5 px-1 py-0.5 font-sans text-[10px] text-zinc-400 ring-1 ring-white/10">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-white/5 px-1 py-0.5 font-sans text-[10px] text-zinc-400 ring-1 ring-white/10">
              ↵
            </kbd>
            open
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-white/5 px-1 py-0.5 font-sans text-[10px] text-zinc-400 ring-1 ring-white/10">
              esc
            </kbd>
            close
          </span>
        </span>
      </div>
    </div>
  );
};

const NavSearchModal = () => {
  const [searchOpen, setSearchOpen] = useAtom(searchOpenAtom);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (searchOpen && !dialog.open) {
      dialog.showModal();
    } else if (!searchOpen && dialog.open) {
      dialog.close();
    }
  }, [searchOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="m-auto h-dvh max-h-none w-screen max-w-none overflow-hidden bg-night p-0 text-white shadow-2xl shadow-black/50 outline-none backdrop:bg-black/40 backdrop:backdrop-blur-md animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 sm:mt-[8dvh] sm:mb-auto sm:h-[min(72dvh,46rem)] sm:w-full sm:max-w-2xl sm:rounded-xl sm:ring-1 sm:ring-white/10"
      onClose={() => setSearchOpen(false)}
      onMouseDown={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const isInsidePanel =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!isInsidePanel) {
          event.currentTarget.close();
        }
      }}
    >
      <Activity mode={searchOpen ? "visible" : "hidden"}>
        <NavSearchPanel />
      </Activity>
    </dialog>
  );
};

export const NavSearch = () => {
  const [, setSearchOpen] = useAtom(searchOpenAtom);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setSearchOpen]);

  return <NavSearchModal />;
};


