import {useState} from 'react';
import {Scrollbar} from './Scrollbar.tsx';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

type EpisodeResultProps = React.ComponentPropsWithoutRef<'div'>;

const EpisodeResult = (props: EpisodeResultProps) => {
  const {...rest} = props;

  return (
    <div
      className="flex w-full flex-col first:border-t border-b border-zinc-800/50 py-2.5 gap-1"
      {...rest}>
      <h3 className="text-sm font-medium text-zinc-300">
        Painkiller Already - Topic talk
      </h3>
      <h4 className="text-xs text-zinc-400">Thursday 14th October 2010</h4>
      <div className="mt-1.5 flex gap-2">
        <div className="w-fit rounded-[10px] bg-primary py-1.25 px-2 tracking-wider font-[425]  text-white text-xs uppercase">
          EP 747
        </div>
        <div className="w-fit rounded-[10px] bg-zinc-800/75 py-1.25 px-2 tracking-wider font-[425]  text-white text-xs uppercase">
          4H 8M
        </div>
      </div>
    </div>
  );
};

export const NavSearch = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="flex w-full items-center justify-center rounded-lg bg-zinc-900/50 p-1.5 text-left text-sm text-zinc-500 outline-1 outline-zinc-800 hover:bg-zinc-900 hover:outline-zinc-700/75 hover:cursor-pointer"
        onFocus={() => setOpen(true)}
        type="button">
        <MagnifyingGlassIcon className="mr-1.5 h-4 w-4 text-zinc-500" />
        Search...
      </button>
      {open && (
        <div
          className="fixed top-0 left-0 z-10 size-full bg-black/25 p-16 backdrop-blur-md"
          onMouseDown={() => {
            setOpen(false);
          }}>
          <div
            className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-800/50 bg-night"
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center border-zinc-800/50 border-b pl-4">
              <MagnifyingGlassIcon className="h-5 w-5 stroke-[2.5px] text-zinc-400" />
              <input
                className="w-full bg-transparent p-4 text-base text-zinc-300 caret-primary outline-hidden selection:bg-zinc-700 placeholder:text-zinc-400"
                placeholder="Search..."
                // biome-ignore lint/a11y/noAutofocus: Modal autofocus is desired behaviour
                autoFocus
              />
            </div>
            <div className="mx-6 my-4">
              <div className="text-zinc-400 font-light text-sm">
                749 results
              </div>
              <div className="flex gap-2 mt-2.5">
                <button
                  className="rounded-[10px] bg-primary py-1.25 px-3 tracking-wider font-[425]  text-white text-xs uppercase hover:cursor-pointer"
                  type="button">
                  Episodes
                </button>
                <button
                  className="rounded-[10px] bg-primary py-1.25 px-3 tracking-wider font-[425]  text-white text-xs uppercase hover:cursor-pointer opacity-50"
                  type="button">
                  Events
                </button>
              </div>
            </div>
            <Scrollbar element="div">
              <div className="mx-6 mb-6">
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
                <EpisodeResult />
              </div>
            </Scrollbar>
          </div>
        </div>
      )}
    </div>
  );
};
