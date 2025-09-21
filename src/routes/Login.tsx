import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "Login"!</div>;
}
