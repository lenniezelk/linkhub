import Container from '@/components/Container'
import { useAppSession } from '@/lib/useAppSession';
import { googleLogout } from '@react-oauth/google';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';
import { useEffect } from 'react';


export const Route = createFileRoute('/Logout')({
    component: RouteComponent,
})

const logout = createServerFn({ method: 'POST' }).handler(async (ctx) => {
    const appSession = await useAppSession();

    await appSession.clear();

    return { status: 'SUCCESS' };
});

function RouteComponent() {
    const navigate = useNavigate()

    useEffect(() => {
        googleLogout();
        logout().then(() => {
            navigate({ to: '/', replace: true });
        });
    }, []);

    return (
        <Container>
            <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
                <h1 className="text-2xl font-bold mb-4">Logging Out...</h1>
            </main>
        </Container>
    )
}
