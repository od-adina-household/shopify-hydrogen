import { Suspense, useState } from 'react';
import { Await, Link, NavLink } from 'react-router';
import type { FooterQuery, HeaderQuery } from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      // Replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-3">
      <p className="text-xs font-medium">Get the latest updates</p>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 bg-transparent border border-foreground/20 text-xs focus:outline-none focus:border-foreground transition-colors"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email}
          className="px-4 py-2 border border-foreground text-xs font-medium hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined' : 'Join'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-500">Something went wrong. Try again.</p>
      )}
    </form>
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
          <footer className="bg-sidebar text-foreground px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-24">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Logo */}
                <div className="col-span-12 lg:col-span-2 text-foreground">
                  <svg className="w-40 lg:w-60 h-auto" width="687.1" height="430" viewBox="0 0 687.1 430" xmlns="http://www.w3.org/2000/svg" aria-label="Logo">
                    <rect x="237.5" fill="currentColor" width="214.5" height="430"/>
                    <rect fill="currentColor" width="214.5" height="430"/>
                    <path fill="currentColor" d="M687.1,0v430c-118.8,0-215-96.3-215-215S568.4,0,687.1,0"/>
                  </svg>
                </div>

                {/* Divider */}
                <div className="hidden lg:block lg:col-span-1 h-32 border-r border-foreground/10"></div>

                {/* Newsletter & Content */}
                <div className="col-span-12 lg:col-span-6 font-sans space-y-8">
                  <NewsletterSignup />

                  <div className="flex flex-wrap items-center justify-between gap-4 font-sans">
                    <p className="text-xs">
                      © {new Date().getFullYear()} AdinaHousehold with ❤️ from{' '}
                      <a
                        href="https://otherdev.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-70 transition-opacity"
                      >
                        Otherdev
                      </a>
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <Link to="/pages/cookies" className="hover:opacity-70 transition-opacity">
                        Cookie statement
                      </Link>
                      <Link to="/pages/privacy-policy" className="hover:opacity-70 transition-opacity">
                        Privacy statement
                      </Link>
                      <Link to="/pages/terms-of-service" className="hover:opacity-70 transition-opacity">
                        Terms and conditions
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block lg:col-span-1 h-32 border-r border-foreground/10"></div>

                {/* Social Icons */}
                <div className="col-span-12 lg:col-span-2 flex lg:flex-col gap-4 items-center lg:items-end">
                  <a
                    href="https://www.instagram.com/adina.household/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-foreground text-foreground flex items-center justify-center hover:bg-foreground/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-foreground text-foreground flex items-center justify-center hover:bg-foreground/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-foreground text-foreground flex items-center justify-center hover:bg-foreground/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}
