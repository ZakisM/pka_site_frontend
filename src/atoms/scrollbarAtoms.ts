import {atom} from 'jotai';
import type {CacheSnapshot} from 'virtua';

export const scrollbarStateAtom = atom<
  Record<string, {offset: number; cache: CacheSnapshot}>
>({});
