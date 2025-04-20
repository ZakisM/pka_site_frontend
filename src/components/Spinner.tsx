import {ArrowPathIcon} from '@heroicons/react/24/outline';

export const Spinner = () => (
  <div className="flex w-full h-full items-center justify-center">
    <ArrowPathIcon className="text-primary h-8 w-8 inline-block animate-spin" />
  </div>
);
