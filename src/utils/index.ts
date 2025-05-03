import type {TimerId} from '@/types';

export const clsx = (...classes: (string | boolean)[]) => {
  return classes.filter((cl) => Boolean(cl)).join(' ');
};

export const debounce = <T extends (...args: any[]) => any>(
  callback: T,
  duration: number,
) => {
  let timerId: TimerId;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      callback.apply(this, args);
    }, duration);
  };
};
