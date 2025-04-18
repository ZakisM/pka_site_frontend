import {useState} from 'react';
import {Scrollbar} from './Scrollbar.tsx';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

type EpisodeResultProps = React.ComponentPropsWithoutRef<'div'>;

const EpisodeResult = (props: EpisodeResultProps) => {
  const {...rest} = props;

  return (
    <div
      className="group mb-3 flex items-center justify-between text-sm"
      {...rest}>
      <div className="flex flex-col rounded-md p-2 data-active:bg-red-600/35">
        <span className="font-medium text-zinc-300">
          Painkiller Already Episode 26
        </span>
        <span className="text-xs text-zinc-500 group-data-active:text-zinc-300">
          Thursday 14th October 2010
        </span>
      </div>
      <div className="text-zinc-50">LMFAO</div>
    </div>
  );
};

export const NavSearch = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="flex w-full items-center justify-center rounded-lg bg-zinc-900/50 p-1.5 text-left text-sm text-zinc-600 outline outline-1 outline-zinc-800 hover:bg-zinc-900 hover:outline-zinc-700/75"
        onFocus={() => setOpen(true)}
        type="button">
        <MagnifyingGlassIcon className="mr-1.5 h-4 w-4 text-zinc-600" />
        Search...
      </button>
      {open && (
        <div
          className="fixed top-0 left-0 z-10 size-full bg-black/50 p-12 backdrop-blur-md sm:p-24"
          onMouseDown={() => {
            setOpen(false);
          }}>
          <div
            className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950"
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center border-zinc-900 border-b pl-4">
              <MagnifyingGlassIcon className="h-5 w-5 stroke-[2.5px] text-zinc-500" />
              <input
                className="w-full bg-transparent p-4 text-sm text-zinc-300 caret-red-600 outline-hidden selection:bg-zinc-600 placeholder:text-zinc-600"
                placeholder="Search..."
                // biome-ignore lint/a11y/noAutofocus: Modal autofocus is desired behaviour
                autoFocus
              />
            </div>
            <div className="mx-6 my-6 flex gap-4">
              <button
                className="rounded-md bg-red-700 p-1.5 font-medium text-white text-xs uppercase"
                type="button">
                Episodes
              </button>
              <button
                className="rounded-md bg-red-700 p-1.5 font-medium text-white text-xs uppercase opacity-50"
                type="button">
                Events
              </button>
            </div>
            <Scrollbar element="div" className="px-6">
              <EpisodeResult data-active />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult />
              <EpisodeResult data-active />
            </Scrollbar>
          </div>
        </div>
      )}
    </div>
  );
};
