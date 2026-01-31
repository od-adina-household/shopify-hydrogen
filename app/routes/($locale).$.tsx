import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { Route } from './+types/$';

export async function loader({ request }: Route.LoaderArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return (
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

      <section className="w-full bg-[#C4A882] px-6 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-[#3C281E] leading-tight mb-6 md:mb-8">
            Popular Collections
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: 'KITCHEN', href: '/collections/kitchen' },
              { title: 'LIGHTING', href: '/collections/lighting' },
              { title: 'FURNITURE', href: '/collections/furniture' },
            ].map((collection) => (
              <Link
                key={collection.title}
                to={collection.href}
                className="group flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white"
              >
                <span className="text-sm font-medium tracking-wider text-foreground uppercase">
                  {collection.title}
                </span>
                <ArrowRight className="h-4 w-4 text-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
