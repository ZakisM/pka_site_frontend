import type {TimerId} from '@/types';

export const clsx = (...classes: (string | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const debounce = <T extends (...args: any[]) => any>(
  callback: T,
  duration: number,
) => {
  let timerId: TimerId | null = null;

  return function debouncedFunction(
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      callback.apply(this, args);
    }, duration);
  };
};
