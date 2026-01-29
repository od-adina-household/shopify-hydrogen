import { Suspense } from 'react';
import { Await, Link, NavLink } from 'react-router';
import type { FooterQuery, HeaderQuery } from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
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
          <footer className="bg-[#3D2817] text-white px-8 py-16">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="md:col-span-3 space-y-6">
                  <div className="flex gap-3">
                    <div className="w-16 h-20 bg-[#E8DDD0] rounded-sm" />
                    <div className="w-16 h-20 bg-[#E8DDD0] rounded-sm" />
                    <div className="w-16 h-20 bg-[#E8DDD0] rounded-sm" />
                  </div>
                </div>

                <div className="md:col-span-9">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold tracking-wide">
                        HELP CENTER
                      </h3>
                      <ul className="space-y-3 text-sm text-white/70">
                        <li>
                          <Link to="/pages/contact" className="hover:text-white transition-colors">
                            Contact us
                          </Link>
                        </li>
                        <li>
                          <Link to="/pages/shipping" className="hover:text-white transition-colors">
                            Shipping
                          </Link>
                        </li>
                        <li>
                          <Link to="/pages/returns" className="hover:text-white transition-colors">
                            Returns
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold tracking-wide">
                        ABOUT US
                      </h3>
                      <ul className="space-y-3 text-sm text-white/70">
                        <li>
                          <Link to="/pages/our-story" className="hover:text-white transition-colors">
                            Our story
                          </Link>
                        </li>
                        <li>
                          <Link to="/pages/sustainability" className="hover:text-white transition-colors">
                            Sustainability
                          </Link>
                        </li>
                        <li>
                          <Link to="/pages/careers" className="hover:text-white transition-colors">
                            Careers
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold tracking-wide">
                        INFORMATION
                      </h3>
                      <ul className="space-y-3 text-sm text-white/70">
                        <li>
                          <Link to="/pages/privacy-policy" className="hover:text-white transition-colors">
                            Privacy policy
                          </Link>
                        </li>
                        <li>
                          <Link to="/pages/terms-of-service" className="hover:text-white transition-colors">
                            Terms of service
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold tracking-wide">
                        CONNECT
                      </h3>
                      <ul className="space-y-3 text-sm text-white/70">
                        <li>
                          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            Instagram
                          </a>
                        </li>
                        <li>
                          <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            Pinterest
                          </a>
                        </li>
                        <li>
                          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            Facebook
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="text-xs text-white/50 tracking-wider">
                  {new Date().getFullYear()} ALL RIGHTS RESERVED
                </p>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}
