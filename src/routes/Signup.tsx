import { createFileRoute } from '@tanstack/react-router'
import Container from '../lib/Container'

export const Route = createFileRoute('/Signup')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Container>
            <div>Signup</div>
        </Container>
    )
}
