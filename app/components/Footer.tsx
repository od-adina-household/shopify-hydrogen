import { Suspense } from 'react';
import { Await, Link } from 'react-router';
import type { FooterQuery, HeaderQuery } from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

const LEGAL_LINKS = [
  { title: 'Cookie Statement', url: '/pages/cookies' },
  { title: 'Privacy Statement', url: '/pages/privacy-policy' },
  { title: 'Terms & Conditions', url: '/pages/terms-of-service' },
];

function SpinningBadge() {
  return (
    <div
      className="shrink-0 w-[100px] h-[100px] lg:w-[140px] lg:h-[140px] motion-safe:animate-spin"
      style={{ animationDuration: '12s', animationTimingFunction: 'linear' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path
            id="badge-circle-path"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
        </defs>
        {/* Outer ring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {/* Inner ring — frames the logo, sits below the text band */}
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.35" />
        {/* Logo mark centered within inner ring */}
        <svg x="24" y="35" width="52" height="30" viewBox="0 0 687.1 430">
          <rect x="237.5" fill="currentColor" width="214.5" height="430" />
          <rect fill="currentColor" width="214.5" height="430" />
          <path fill="currentColor" d="M687.1,0v430c-118.8,0-215-96.3-215-215S568.4,0,687.1,0" />
        </svg>
        {/* Circular text — baseline at r=37, tops at ~r=45, fits between both rings */}
        <text fontSize="8" fill="currentColor" fontFamily="inherit" letterSpacing="1.75" opacity="0.75">
          <textPath href="#badge-circle-path">
            ✦ ADINA HOUSEHOLD ✦ ADINA HOUSEHOLD ✦
          </textPath>
        </text>
      </svg>
    </div>
  );
}

// Instagram icon (rounded square + circle + dot)
function InstagramIcon() {
  return (
    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M23.4871 28H5.51294C3.02916 28 1 25.9708 1 23.4871V5.51294C1 3.02916 3.02916 1 5.51294 1H23.4871C25.9708 1 28 3.02916 28 5.51294V23.4871C28 25.9819 25.9819 28 23.4871 28Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.60453 19.4066C10.913 20.715 12.6538 21.4357 14.5056 21.4357C16.3573 21.4357 18.0871 20.715 19.4066 19.4066C20.715 18.0982 21.4357 16.3573 21.4357 14.5056C21.4357 12.6538 20.715 10.9129 19.4066 9.60453C18.0982 8.29611 16.3573 7.57537 14.5056 7.57537C12.6538 7.57537 10.913 8.29611 9.60453 9.60453C8.29612 10.9129 7.57538 12.6538 7.57538 14.5056C7.57538 16.3573 8.29612 18.0982 9.60453 19.4066Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M22.7866 7.34763C23.5214 7.34763 24.1172 6.75188 24.1172 6.017C24.1172 5.28211 23.5214 4.68637 22.7866 4.68637C22.0517 4.68637 21.4559 5.28211 21.4559 6.017C21.4559 6.75188 22.0517 7.34763 22.7866 7.34763Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// Facebook: circle outer + f letterform, same stroke style
function FacebookIcon() {
  return (
    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M27 14.5C27 21.4 21.4 27 14.5 27C7.6 27 2 21.4 2 14.5C2 7.6 7.6 2 14.5 2C21.4 2 27 7.6 27 14.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17.5 8H15.5C14.1 8 13 9.1 13 10.5V13H10.5V16H13V22H16V16H18.5L19 13H16V10.5C16 10.2 16.2 10 16.5 10H19V8H17.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <FooterContent
            footer={footer}
            header={header}
            publicStoreDomain={publicStoreDomain}
          />
        )}
      </Await>
    </Suspense>
  );
}

type FooterWithCollections = FooterQuery & {
  collections?: { nodes: Array<{ title: string; handle: string }> };
};

function FooterContent({
  footer,
  header,
  publicStoreDomain,
}: {
  footer: FooterQuery | null;
  header: HeaderQuery;
  publicStoreDomain: string;
}) {
  const primaryDomainUrl = header?.shop?.primaryDomain?.url ?? '';
  const footerData = footer as FooterWithCollections | null;
  const menuItems = (footerData?.menu?.items ?? []).filter(
    (item) => item.title?.toLowerCase() !== 'search',
  );
  const collections = footerData?.collections?.nodes ?? [];

  function normalizeUrl(url: string) {
    if (
      url.includes('myshopify.com') ||
      url.includes(publicStoreDomain) ||
      url.includes(primaryDomainUrl)
    ) {
      return new URL(url).pathname;
    }
    return url;
  }

  return (
    <>
      <footer className="bg-sidebar text-foreground">
        <div className="border-t-2 border-foreground">
          <div className="grid lg:grid-cols-[1fr_280px] gap-10 lg:gap-24 p-5 lg:px-12 py-8 lg:py-10">

            {/* Left: spinning badge + nav columns */}
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-14 pb-4">
              <SpinningBadge />
              <div className="flex gap-10 lg:gap-16 mt-1">
                {menuItems.length > 0 && (
                  <ul className="space-y-2 lg:space-y-3">
                    {menuItems.map((item) => {
                      if (!item.url) return null;
                      const url = normalizeUrl(item.url);
                      return (
                        <li key={item.id}>
                          <Link
                            to={url}
                            prefetch="intent"
                            className="text-base leading-snug hover:opacity-30 transition-opacity"
                          >
                            {item.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {collections.length > 0 && (
                  <ul className="space-y-2 lg:space-y-3">
                    {collections.map((collection) => (
                      <li key={collection.handle}>
                        <Link
                          to={`/collections/${collection.handle}`}
                          prefetch="intent"
                          className="text-base leading-snug hover:opacity-30 transition-opacity"
                        >
                          {collection.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <ul className="space-y-2 lg:space-y-3">
                  {LEGAL_LINKS.map((link) => (
                    <li key={link.url}>
                      <Link
                        to={link.url}
                        prefetch="intent"
                        className="text-base leading-snug hover:opacity-30 transition-opacity"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: tagline + social icons */}
            <div className="flex flex-col lg:items-end gap-5 lg:mt-2">
              <p className="text-lg font-medium lg:text-right" style={{ textWrap: 'balance' } as React.CSSProperties}>
                Bringing beauty to every home
              </p>
              <ul className="flex items-center gap-5" aria-label="Social media links">
                <li>
                  <a
                    href="https://www.instagram.com/adina.household/"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Instagram"
                    className="hover:opacity-30 transition-opacity block"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <InstagramIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Facebook"
                    className="hover:opacity-30 transition-opacity block"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <FacebookIcon />
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </footer>

      {/* Bottom wordmark bar */}
      <div className="bg-sidebar text-foreground overflow-hidden">
        <div className="px-5 lg:px-12 relative">
          <svg
            viewBox="0 0 1000 100"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <text
              y="88"
              fill="currentColor"
              fontSize="100"
              fontWeight="700"
              fontFamily="inherit"
              letterSpacing="-2"
              textLength="1000"
              lengthAdjust="spacing"
            >
              ADINA HOUSEHOLD
            </text>
          </svg>
          <p className="text-sm font-medium text-center pt-6 pb-4 lg:pb-6 opacity-80">
            © {new Date().getFullYear()} Adina Household with ❤️ from{' '}
            <a
              href="https://otherdev.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity underline-offset-4 hover:underline"
            >
              Otherdev
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
