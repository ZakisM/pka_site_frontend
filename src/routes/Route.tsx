import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/Route')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/Route"!</div>;
}
