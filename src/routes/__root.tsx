import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router';
import {NavBar} from '@/components/NavBar';
import type {QueryClient} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {Spinner} from '@/components/Spinner';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';

const RouterSpinner = () => {
  const isLoading = useRouterState({select: (s) => s.status === 'pending'});

  return (
    isLoading && (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner className="w-16 h-16" />
      </div>
    )
  );
};

const RootComponent = () => (
  <>
    <NavBar />
    <div className="p-4 content-area overflow-hidden">
      <RouterSpinner />
      <Outlet />
    </div>
    <ReactQueryDevtools buttonPosition="bottom-left" />
    <TanStackRouterDevtools position="bottom-right" />
  </>
);

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
