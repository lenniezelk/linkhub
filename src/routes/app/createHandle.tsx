import Button from '@/components/Button'
import Container from '@/components/Container'
import Input from '@/components/Input'
import Menu from '@/components/Menu'
import { isHandleValid } from '@/lib/validation'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { createServerFn } from '@tanstack/react-start';
import { HandleFormData } from '@/lib/types'
import { dbClient } from '@/lib/db/dbClient'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { useAppSession } from '@/lib/useAppSession'
import InPageNotifications, { useInPageNotifications } from '@/components/InPageNotifications'
import Footer from '@/components/Footer'


export const Route = createFileRoute('/app/createHandle')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    console.log('Checking user in beforeLoad of /app/createHandle:', context.user); // --- IGNORE ---
    if (context.user?.handle) {
      throw redirect({ to: '/app' });
    }
  },
})

const saveHandle = createServerFn({ method: 'POST' }).validator(HandleFormData).handler(async (ctx) => {
  const db = dbClient();
  const handleData = ctx.data;

  const appSession = await useAppSession();
  if (!appSession.data?.user) {
    throw redirect({ to: '/Login' });
  }

  const existingHandle = await db.select().from(usersTable).where(eq(usersTable.handle, handleData.handle)).limit(1);
  if (existingHandle.length > 0) {
    return {
      status: 'ERROR',
      error: 'Handle already in use.',
    };
  }

  db.update(usersTable)
    .set({ handle: handleData.handle })
    .where(eq(usersTable.id, appSession.data.user.id));

  await appSession.update({
    user: {
      id: appSession.data.user.id,
      email: appSession.data.user.email,
      name: appSession.data.user.name,
      handle: handleData.handle,
    },
  });

  return {
    status: 'SUCCESS',
  };
})

function RouteComponent() {
  const [handle, setHandle] = useState('')
  const [handleError, setHandleError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inPageNotifications = useInPageNotifications();
  const navigate = useNavigate();

  const submit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const error = isHandleValid(handle)
    if (error) {
      setHandleError(error)
      return
    }

    setIsSubmitting(true);
    inPageNotifications.clearNotifications();

    saveHandle({ data: { handle } }).then((result) => {
      if (result.status === 'SUCCESS') {
        inPageNotifications.addNotification({ type: 'success', message: 'Username updated successfully! Redirecting...', keepForever: true });
        navigate({ to: '/app', replace: true });
      } else {
        inPageNotifications.addNotification({ type: 'error', message: result.error, keepForever: true });
      }
    }).finally(() => {
      setIsSubmitting(false);
    });

  }, [handle])

  return <Container>
    <Menu />
    <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
      <InPageNotifications />
      <h1 className="text-2xl font-bold mb-4 text-slate-900">Create Your Handle/Username</h1>
      <p className="mb-4 text-slate-900">Choose a unique handle/username for your account. This will be used to identify you on the platform.</p>
      <form className="max-w-md w-full" noValidate onSubmit={submit}>
        <div>
          <Input
            type="text"
            id="handle"
            name="handle"
            placeholder="Enter your handle/username"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value)
              setHandleError(isHandleValid(e.target.value))
            }}
            error={handleError}
          />
          <div className="mt-4 flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Handle'}
            </Button>
          </div>
        </div>
      </form>
    </main>
    <Footer />
  </Container>
}
