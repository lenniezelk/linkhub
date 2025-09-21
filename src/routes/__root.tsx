import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { createServerFn } from '@tanstack/react-start';
import appCss from '../styles.css?url'
import { useAppSession } from '@/lib/useAppSession';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { InPageNotificationsProvider } from '@/components/InPageNotifications';

export const fetchMe = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession();
  if (!session.data?.user) {
    return { status: 'ERROR', error: 'Not authenticated' };
  }

  return { status: 'SUCCESS', data: { user: session.data.user } };
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootComponent,
    beforeLoad: async () => {
    const result = await fetchMe();

    if (result.status === 'ERROR') {
      return {
        user: null,
      }
    }

    return {
      user: result.data.user,
    }
  }
})

function RootComponent() {
    return (
        <GoogleOAuthProvider clientId="659954519046-7f8jlgvqi1q6mqlgpgc92g2e8tca1tu1.apps.googleusercontent.com">
                <InPageNotificationsProvider>
                    <RootDocument>
                        <Outlet />
                    </RootDocument>
                </InPageNotificationsProvider>
        </GoogleOAuthProvider>
    )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanstackDevtools
          config={{
            position: 'bottom-left',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
