import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';
import appCss from '../styles.css?url'
import logoSvg from '../assets/logo.svg?url'
import { useAppSession } from '@/lib/useAppSession';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { InPageNotificationsProvider } from '@/components/InPageNotifications';
import { TooltipProvider } from '@/components/ui/tooltip';


// Devtools are dynamically imported only in development to avoid production build issues
let Devtools: React.ReactNode = null;
if (import.meta.env.DEV) {
  // Use dynamic imports to ensure these heavy + potentially incompatible SSR packages are not in prod bundle
  const RouterPanelPromise = import('@tanstack/react-router-devtools').then(m => m.TanStackRouterDevtoolsPanel);
  const DevtoolsPromise = import('@tanstack/react-devtools').then(m => m.TanstackDevtools);
  Promise.all([RouterPanelPromise, DevtoolsPromise]).then(([RouterPanel, DevtoolsComp]) => {
    // Assign a JSX element to variable (cannot set state here easily; this runs once on module eval in dev)
    Devtools = (
      <DevtoolsComp
        config={{ position: 'bottom-left' }}
        plugins={[{ name: 'Tanstack Router', render: <RouterPanel /> }]}
      />
    );
  }).catch(() => {
    // swallow errors in devtools loading
  });
}


export const fetchMe = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession();
  if (!session.data?.user) {
    return { status: 'ERROR', error: 'Not authenticated' };
  }

  return { status: 'SUCCESS', data: { user: session.data.user, userProfile: session.data.userProfile } };
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
        title: 'LinkHub | Home',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: logoSvg,
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
      userProfile: result.data.userProfile,
    }
  },
  notFoundComponent: () => <div>404 - Not Found</div>,
})

function RootComponent() {
  return (
    <GoogleOAuthProvider clientId="659954519046-7f8jlgvqi1q6mqlgpgc92g2e8tca1tu1.apps.googleusercontent.com">
      <InPageNotificationsProvider>
        <TooltipProvider>
          <RootDocument>
            <Outlet />
          </RootDocument>
        </TooltipProvider>
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
        {Devtools}
        <Scripts />
      </body>
    </html>
  )
}
