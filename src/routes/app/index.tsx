import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/')({
    component: RouteComponent,
        beforeLoad: async ({ context }) => {
            if (!context.user) {
                throw redirect({ to: '/Login' });
            }
            if (context.user && !context.user.handle) {
                throw redirect({ to: '/app/createHandle' });
            }
        },
})

function RouteComponent() {
    return <div>Hello "/app/"!</div>;
}
