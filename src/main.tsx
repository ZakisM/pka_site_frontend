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
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => (
    <Navigate to="/watch/$episodeId" params={{episodeId: 'latest'}} replace />
  ),
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
