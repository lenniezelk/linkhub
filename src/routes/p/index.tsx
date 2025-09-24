import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/p/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/p/"!</div>
}
