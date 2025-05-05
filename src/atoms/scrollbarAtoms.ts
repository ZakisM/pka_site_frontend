import type {CacheSnapshot} from 'virtua';
import {atom} from 'jotai';

export const scrollbarStateAtom = atom<{
  [key: string]: {offset: number; cache: CacheSnapshot};
}>({});
