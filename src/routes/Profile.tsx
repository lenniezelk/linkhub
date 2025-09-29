import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/Profle"!</div>
}
