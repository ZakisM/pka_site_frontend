import type {QueryClient} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import {NavBar} from '@/components/NavBar';
import {Spinner} from '@/components/Spinner';

const RouterSpinner = () => {
  const isLoading = useRouterState({select: (s) => s.status === 'pending'});

  return isLoading && <Spinner />;
};

const RootComponent = () => (
  <>
    <NavBar />
    <div className="p-4 content-area">
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
