import { NavLink } from 'react-router';
import type { HeaderQuery } from 'storefrontapi.generated';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menu: HeaderQuery['menu'];
  primaryDomainUrl: string;
  publicStoreDomain: string;
}

export function MobileMenu({
  isOpen,
  onClose,
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: MobileMenuProps) {
  if (!isOpen) return null;

  const menuItems = menu?.items || [];

  return (
    <div
      className="fixed inset-0 z-40 bg-[rgb(178,160,124)] pt-28 px-6 overflow-y-auto"
      onClick={onClose}
    >
      <nav className="flex flex-col" onClick={(e) => e.stopPropagation()}>
        {menuItems.map((item) => {
          if (!item.url) return null;

          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;

          return (
            <NavLink
              key={item.id}
              to={url}
              onClick={onClose}
              className="text-[40px] leading-[44px] font-serif font-normal text-[rgb(60,40,30)] mb-[25px] hover:opacity-70 transition-opacity"
            >
              {item.title}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
