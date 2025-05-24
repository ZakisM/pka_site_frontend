import {Outlet, createRootRouteWithContext} from '@tanstack/react-router';
import {NavBar} from '@/components/NavBar';
import type {QueryClient} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';

const RootComponent = () => (
  <>
    <NavBar />
    <div className="p-4 content-area overflow-hidden">
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
