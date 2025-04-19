import type {QueryClient} from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {NavBar} from '../components/NavBar';
import {ArrowPathIcon} from '@heroicons/react/24/outline';

const RouterSpinner = () => {
  const isLoading = useRouterState({select: (s) => s.status === 'pending'});

  return (
    isLoading && (
      <div className="flex w-full h-full items-center justify-center">
        <ArrowPathIcon className="text-primary h-8 w-8 inline-block animate-spin" />
      </div>
    )
  );
};

const RootComponent = () => (
  <>
    <NavBar />
    <div className="p-4 content-area">
      <RouterSpinner />
      <Outlet />
    </div>
    <ReactQueryDevtools buttonPosition="top-right" />
    <TanStackRouterDevtools position="bottom-right" />
  </>
);

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
