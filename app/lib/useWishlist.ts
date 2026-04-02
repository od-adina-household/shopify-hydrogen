import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'od_wishlist';

export type WishlistItem = {
  id: string;
  handle: string;
  title: string;
  image?: { url: string; altText?: string | null };
  price: { amount: string; currencyCode: string };
};

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((current) => {
      const exists = current.some((i) => i.id === item.id);
      const next = exists
        ? current.filter((i) => i.id !== item.id)
        : [...current, item];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items],
  );

  const remove = useCallback((id: string) => {
    setItems((current) => {
      const next = current.filter((i) => i.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { items, toggle, isWishlisted, remove };
}
