import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import { HeartIcon, MenuIcon, SearchIcon, ShoppingBag, UserIcon, X } from 'lucide-react';
import { Suspense, useEffect, useId, useRef, useState } from 'react';
import { Await, NavLink, useAsyncValue, useLocation } from 'react-router';
import type { CartApiQueryFragment, HeaderQuery } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import { MobileMenu } from '~/components/MobileMenu';
import { ModeToggle } from '~/components/mode-toggle';
import { SearchFormPredictive } from '~/components/SearchFormPredictive';
import { SearchResultsPredictive } from '~/components/SearchResultsPredictive';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const { shop, menu } = header;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Determine if we are on the homepage (handling potential locale prefixes)
  const isHome = location.pathname === '/' || /^\/(en|nl|de|fr)(\/|$)/.test(location.pathname);

  const headerBgClass = isMobileMenuOpen
    ? 'bg-[rgb(178,160,124)]'
    : isHome
      ? (isScrolled ? 'bg-background shadow-sm' : 'bg-transparent')
      : 'bg-background shadow-sm';

  const textColorClass = isMobileMenuOpen
    ? 'text-[rgb(60,40,30)]'
    : isHome
      ? (isScrolled ? 'text-foreground' : 'text-white')
      : 'text-foreground';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 pt-4 pb-2 md:pt-5 md:pb-1.5 transition-all duration-300 ${headerBgClass}`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <NavLink
            prefetch="intent"
            to="/"
            end
            className={`flex items-center hover:opacity-80 transition-opacity flex-shrink-0 ${textColorClass}`}
          >
            <img
              src="/logo.png"
              alt={shop.name}
              className="h-6 md:h-8 w-auto"
            />
          </NavLink>
          <HeaderCtas
            isLoggedIn={isLoggedIn}
            cart={cart}
            isScrolled={isScrolled}
            isHome={isHome}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>
      </header>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        menu={menu}
        primaryDomainUrl={shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
    </>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const { close } = useAside();

  const navClassName =
    viewport === 'desktop'
      ? 'hidden md:flex items-center gap-x-8'
      : 'flex flex-col space-y-1';

  // Progressive hiding breakpoints for each menu item (from right to left)
  const getItemBreakpoint = (index: number, total: number) => {
    if (viewport !== 'desktop') return '';

    // Hide items progressively: last item first, first item last
    const reverseIndex = total - 1 - index;

    switch (reverseIndex) {
      case 0: // Last item (About) - hide at xl breakpoint (1280px) instead of 980px
        return 'max-xl:hidden';
      case 1: // Third item (Policies) - hide at lg breakpoint (1024px) instead of 900px
        return 'max-lg:hidden';
      case 2: // Second item (Blog) - hide at md breakpoint (768px) instead of 820px
        return 'max-md:hidden';
      case 3: // First item (Collections) - stays visible
        return '';
      default:
        return '';
    }
  };

  const menuItems = (menu || FALLBACK_HEADER_MENU).items;

  return (
    <nav className={navClassName} role="navigation">
      {menuItems.map((item, index) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        const breakpointClass = getItemBreakpoint(index, menuItems.length);

        return (
          <NavLink
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
            className={
              viewport === 'desktop'
                ? `text-xs font-semibold tracking-widest uppercase hover:text-muted-foreground transition-colors whitespace-nowrap ${breakpointClass}`
                : 'text-sm font-semibold tracking-widest uppercase py-3 hover:text-muted-foreground transition-colors'
            }
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
  isScrolled,
  isHome,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'> & {
  isScrolled: boolean;
  isHome: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}) {
  const textColorClass = isHome
    ? (isScrolled ? 'text-foreground' : 'text-white')
    : 'text-foreground';

  return (
    <div className="flex items-center gap-x-1 sm:gap-x-2 flex-shrink-0" role="navigation">
      <SearchToggle isScrolled={isScrolled} isHome={isHome} />
      <Button variant="ghost" size="icon-lg" className={`h-10 w-10 p-0 ${textColorClass}`} asChild>
        <NavLink
          prefetch="intent"
          to="/account"
        >
          <UserIcon className="w-[26px] h-[26px]" />
          <span className="sr-only">
            <Suspense fallback="Account">
              <Await resolve={isLoggedIn} errorElement="Account">
                {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
              </Await>
            </Suspense>
          </span>
        </NavLink>
      </Button>
      <HeaderMenuMobileToggle
        isScrolled={isScrolled}
        isHome={isHome}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <CartToggle cart={cart} isScrolled={isScrolled} isHome={isHome} />
    </div>
  );
}

function HeaderMenuMobileToggle({
  isScrolled,
  isHome,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  isScrolled: boolean;
  isHome: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}) {
  const textColorClass = isHome
    ? (isScrolled ? 'text-foreground' : 'text-white')
    : 'text-foreground';

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className={`h-10 w-10 p-0 ${textColorClass}`}
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      {isMobileMenuOpen ? (
        <X className="w-[26px] h-[26px]" />
      ) : (
        <MenuIcon className="w-[26px] h-[26px]" />
      )}
      <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
    </Button>
  );
}

function SearchToggle({ isScrolled, isHome }: { isScrolled: boolean; isHome: boolean }) {
  const { open } = useAside();
  const textColorClass = isHome
    ? (isScrolled ? 'text-foreground' : 'text-white')
    : 'text-foreground';

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className={`h-10 w-10 p-0 ${textColorClass}`}
      onClick={() => open('search')}
    >
      <SearchIcon className="w-[20px] h-[20px]" />
      <span className="sr-only">Search</span>
    </Button>
  );
}

function CartBadge({ count, isScrolled, isHome }: { count: number | null; isScrolled: boolean; isHome: boolean }) {
  const { open } = useAside();
  const { publish, shop, cart, prevCart } = useAnalytics();
  
  const textColorClass = isHome
    ? (isScrolled ? 'text-foreground' : 'text-white')
    : 'text-foreground';

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className={`relative h-10 w-10 ${textColorClass}`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <ShoppingBag className="w-[26px] h-[26px]" />
      {count !== null && count > 0 && (
        <Badge
          variant="default"
          className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
      <span className="sr-only">
        Cart {count === null ? '' : `(${count} items)`}
      </span>
    </Button>
  );
}

function CartToggle({ cart, isScrolled, isHome }: Pick<HeaderProps, 'cart'> & { isScrolled: boolean; isHome: boolean }) {
  return (
    <Suspense fallback={<CartBadge count={null} isScrolled={isScrolled} isHome={isHome} />}>
      <Await resolve={cart}>
        <CartBanner isScrolled={isScrolled} isHome={isHome} />
      </Await>
    </Suspense>
  );
}

function CartBanner({ isScrolled, isHome }: { isScrolled: boolean; isHome: boolean }) {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} isScrolled={isScrolled} isHome={isHome} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/0',
  items: [
    {
      id: 'gid://shopify/MenuItem/1',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/2',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/3',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/4',
      resourceId: 'gid://shopify/Page/1',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};