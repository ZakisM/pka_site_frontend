import {useState} from 'react';
import {Scrollbar} from './Scrollbar';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

type EpisodeResultProps = React.ComponentPropsWithoutRef<'div'>;

const EpisodeResult = (props: EpisodeResultProps) => {
    const {...rest} = props;

    return (
        <div
            className="group mb-3 flex flex-col rounded-md p-2 data-[active]:bg-red-500/60"
            {...rest}>
            <span className="font-medium text-sm text-zinc-300">
                Painkiller Already Episode 26
            </span>
            <span className="text-xs text-zinc-500 group-data-[active]:text-zinc-200">
                Thursday 14th October 2010
            </span>
        </div>
    );
};

export const NavSearch = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="col-span-2">
            <button
                className="flex w-full items-center justify-center rounded-lg bg-zinc-900/50 p-1.5 text-left text-sm text-zinc-600 outline outline-1 outline-zinc-800 hover:bg-zinc-900 hover:outline-zinc-700/75"
                onFocus={() => setOpen(true)}
                type="button">
                <MagnifyingGlassIcon className="mr-1.5 h-4 w-4 text-zinc-600" />
                Search...
            </button>
            {open && (
                <div
                    className="fixed top-0 left-0 z-10 size-full bg-black/75 p-4 backdrop-blur-lg xl:p-28"
                    onMouseDown={() => {
                        setOpen(false);
                    }}>
                    <div
                        className="mx-auto h-full max-w-2xl overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950"
                        onMouseDown={(e) => e.stopPropagation()}>
                        <div className="flex items-center border-zinc-900 border-b pl-4">
                            <MagnifyingGlassIcon className="h-5 w-5 stroke-[2.5px] text-zinc-500" />
                            <input
                                className="w-full bg-transparent p-4 text-sm text-zinc-300 caret-red-600 outline-none selection:bg-zinc-600 placeholder:text-zinc-600"
                                placeholder="Search..."
                                // biome-ignore lint/a11y/noAutofocus: Modal autofocus is desired behaviour
                                autoFocus
                            />
                        </div>
                        <Scrollbar
                            element="div"
                            className="h-[calc(100%-41px)] p-4">
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
