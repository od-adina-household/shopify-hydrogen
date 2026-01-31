import { Analytics, getShopAnalytics, useNonce } from '@shopify/hydrogen';
import { ArrowRight } from 'lucide-react';
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useRouteLoaderData,
  type ShouldRevalidateFunction,
} from 'react-router';
import { Footer } from '~/components/Footer';
import { FOOTER_QUERY, HEADER_QUERY } from '~/lib/fragments';
import { themeSessionResolver } from '~/lib/sessions.server';
import type { Route } from './+types/root';
import Styling from './app.css?url';
import { PageLayout } from './components/PageLayout';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const { storefront, env } = args.context;

  // Get theme from session
  const { getTheme } = await themeSessionResolver(args.request);

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN || env.PUBLIC_STORE_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
    theme: getTheme(),
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context }: Route.LoaderArgs) {
  const { storefront } = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return { header };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: Route.LoaderArgs) {
  const { storefront, customerAccount, cart } = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function LayoutWithTheme({ children }: { children?: React.ReactNode }) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');

  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={Styling}></link>
        <Meta />
        <Links />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function AppWithProviders() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <LayoutWithTheme>
      <AppContent />
    </LayoutWithTheme>
  );
}

function AppContent() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  // Only enable analytics in production
  const isProduction = import.meta.env.PROD;

  // Disable analytics in development to prevent CORS errors
  if (!isProduction) {
    return (
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    );
  }

  return (
    <Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export default AppWithProviders;

export function ErrorBoundary() {
  const error = useRouteError();
  const rootData = useRouteLoaderData<RootLoader>('root');
  let errorStatus = 500;
  let is404 = false;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    is404 = errorStatus === 404;
  }

  if (is404) {
    return (
      <LayoutWithTheme>
        <div className="w-full">
          <section className="w-full px-6 md:px-8 lg:px-12 py-16 md:py-24 lg:py-32">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl">
                <p className="text-sm md:text-base font-medium tracking-[0.2em] uppercase text-[#3C281E] mb-6">
                  Error 404
                </p>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal text-[#3C281E] leading-tight mb-6 md:mb-8 italic">
                  Page not found
                </h1>

                <p className="text-[#3C281E] font-sans text-base md:text-lg leading-relaxed max-w-2xl mb-8 md:mb-12">
                  The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let us guide you back to discovering beautiful objects for your home.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-3 text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-[#3C281E] underline underline-offset-4 decoration-1 hover:no-underline transition-all duration-300"
                  >
                    Back to Home
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    to="/collections/all"
                    className="inline-flex items-center gap-3 text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-[#3C281E] underline underline-offset-4 decoration-1 hover:no-underline transition-all duration-300"
                  >
                    Browse Collections
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    to="/search"
                    className="inline-flex items-center gap-3 text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-[#3C281E] underline underline-offset-4 decoration-1 hover:no-underline transition-all duration-300"
                  >
                    Search
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
        {rootData && (
          <Footer
            footer={rootData.footer}
            header={rootData.header}
            publicStoreDomain={rootData.publicStoreDomain}
          />
        )}
      </LayoutWithTheme>
    );
  }

  return (
    <LayoutWithTheme>
      <div className="w-full px-6 md:px-8 lg:px-12 py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-sm md:text-base font-medium tracking-[0.2em] uppercase text-[#3C281E] mb-6">
              Error {errorStatus}
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal text-[#3C281E] leading-tight mb-6 md:mb-8 italic">
              Something went wrong
            </h1>

            <p className="text-[#3C281E] font-sans text-base md:text-lg leading-relaxed max-w-2xl mb-8 md:mb-12">
              We apologize for the inconvenience. An unexpected error has occurred. Please try again or return to the homepage.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-3 text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-[#3C281E] underline underline-offset-4 decoration-1 hover:no-underline transition-all duration-300"
            >
              Back to Home
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
      {rootData && (
        <Footer
          footer={rootData.footer}
          header={rootData.header}
          publicStoreDomain={rootData.publicStoreDomain}
        />
      )}
    </LayoutWithTheme>
  );
}