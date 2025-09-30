import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/l/')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    // Redirect to home if user is logged in
    if (context.user) {
      throw redirect({ to: '/app', replace: true });
    } else {
      throw redirect({ to: '/', replace: true });
    }
  }
})

function RouteComponent() {
  return <div>Hello "/l/"!</div>;
}
