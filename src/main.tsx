import '@fontsource-variable/raleway';
import '@fontsource-variable/roboto';
import 'core-js/stable';
import 'overlayscrollbars/overlayscrollbars.css';
import './styles.css';
import * as React from 'react';
import {Navigate, RouterProvider, createRouter} from '@tanstack/react-router';
import {QueryClientProvider} from '@tanstack/react-query';
import {LinkButton} from './components/LinkButton';
import ReactDOM from 'react-dom/client';
import {routeTree} from './routeTree.gen';
import {queryClient} from './queryClient';

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
    console.error(err.error);

    return (
      <div className="flex flex-col h-full justify-center items-center gap-4">
        <h1 className="text-zinc-300 text-md">An error occurred!</h1>
        <LinkButton
          className="text-sm"
          to="/watch/$episodeId"
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

const container = document.querySelector('#root');
if (!container) {
  throw new Error('Failed to find element for createRoot.');
}

const rootElement = document.querySelector('#root') as HTMLElement;
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
