import {atom} from 'jotai';

export const searchOpenAtom = atom(false);
export const searchScrollStateAtom = atom(0);
export const searchQueryAtom = atom('');
export const debouncedSearchQueryAtom = atom('');
