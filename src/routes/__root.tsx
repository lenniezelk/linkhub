import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';
import appCss from '../styles.css?url'
import logoSvg from '../assets/logo.svg?url'
import { useAppSession } from '@/lib/useAppSession';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { InPageNotificationsProvider } from '@/components/InPageNotifications';
import { TooltipProvider } from '@/components/ui/tooltip';
import { onLCP, onINP, onCLS } from 'web-vitals/attribution';
import type { CLSMetricWithAttribution, INPMetricWithAttribution, LCPMetricWithAttribution } from 'web-vitals/attribution';
import { getBindings } from '@/lib/cf_bindings';

// Type for Web Vitals metrics
type WebVitalMetric = CLSMetricWithAttribution | INPMetricWithAttribution | LCPMetricWithAttribution;
import { useEffect } from 'react';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}


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

export const getEnvVars = createServerFn({ method: 'GET' }).handler(async () => {
  const env = getBindings();
  return {
    GOOGLE_OAUTH_CLIENT_ID: env.GOOGLE_OAUTH_CLIENT_ID,
    GTAG: env.GTAG,
  };
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
    scripts: import.meta.env.SSR ? [] : [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${(globalThis as any).__envVars?.GTAG || ''}`,
        async: true,
      },
      {
        children: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${(globalThis as any).__envVars?.GTAG || ''}');
        `,
      },
    ],
  }),

  shellComponent: RootComponent,
  beforeLoad: async () => {
    const result = await fetchMe();
    const envVars = await getEnvVars();

    if (result.status === 'ERROR') {
      return {
        user: null,
        envVars,
      }
    }

    return {
      user: result.data.user,
      userProfile: result.data.userProfile,
      envVars,
    }
  },
  notFoundComponent: () => <div>404 - Not Found</div>,
})

function sendToGoogleAnalytics(metric: WebVitalMetric) {
  const { name, delta, value, id, attribution } = metric;

  const eventParams: Record<string, any> = {
    // Built-in params:
    value: delta, // Use `delta` so the value can be summed.
    // Custom params:
    metric_id: id, // Needed to aggregate events.
    metric_value: value, // Optional.
    metric_delta: delta, // Optional.
  };

  switch (name) {
    case 'CLS':
      eventParams.debug_target = (attribution as any)?.largestShiftTarget;
      break;
    case 'INP':
      eventParams.debug_target = (attribution as any)?.interactionTarget;
      break;
    case 'LCP':
      eventParams.debug_target = (attribution as any)?.element;
      break;
  }

  // Use the global gtag function if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, eventParams);
  }
}

function RootComponent() {
  const context = Route.useRouteContext();
  const googleClientId = context.envVars?.GOOGLE_OAUTH_CLIENT_ID || '';

  console.log('Google OAuth Client ID from context:', googleClientId);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
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
  useEffect(() => {
    // Track Core Web Vitals and send to Google Analytics
    onCLS(sendToGoogleAnalytics);
    onLCP(sendToGoogleAnalytics);
    onINP(sendToGoogleAnalytics);
  }, []);

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
