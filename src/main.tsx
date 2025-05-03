import '@fontsource-variable/raleway';
import '@fontsource-variable/roboto';
import 'core-js/stable';
import 'overlayscrollbars/overlayscrollbars.css';
import './styles.css';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createRouter, Navigate, RouterProvider} from '@tanstack/react-router';
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import {routeTree} from './routeTree.gen';
import {LinkButton} from './components/LinkButton';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const router = createRouter({
  routeTree,
  context: {queryClient},
  defaultPendingMs: 0,
  defaultPendingMinMs: 0,
  defaultPendingComponent: () => null,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => (
    <Navigate to="/watch/$episodeId" params={{episodeId: 'latest'}} replace />
  ),
  defaultErrorComponent: (err) => {
    console.error(err);

    return (
      <div className="flex flex-col h-full justify-center items-center gap-4">
        <h1 className="text-zinc-300 text-md">An error occurred!</h1>
        <LinkButton
          className="text-sm"
          to={'/watch/$episodeId'}
          params={{episodeId: 'latest'}}>
          Go Home
        </LinkButton>
      </div>
    );
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find element for createRoot.');
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
