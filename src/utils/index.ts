export const clsx = (...classes: (string | boolean)[]) => {
  return classes.filter((cl) => Boolean(cl)).join(' ');
};
