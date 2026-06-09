import { atomFamily, atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai';

export const playerScrollRequestTriggerAtom = atom(Date.now());

export const playerSeekRequestAtom = atom<{ seconds: number; requestedAt: number } | null>(null);

export const playerTimestampAtomFamily = atomFamily((videoId: string) => atomWithStorage(videoId, 0))
