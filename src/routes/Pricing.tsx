import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Pricing')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/Pricing"!</div>
}
