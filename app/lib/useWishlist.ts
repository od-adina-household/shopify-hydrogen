import { useState, useEffect, useCallback } from 'react';
import type { CurrencyCode } from '@shopify/hydrogen/storefront-api-types';

const STORAGE_KEY = 'od_wishlist';
const STORAGE_VERSION = 1;

export type WishlistItem = {
  id: string;
  handle: string;
  title: string;
  image?: { url: string; altText?: string | null };
  price: { amount: string; currencyCode: CurrencyCode };
};

// Module-level cache so multiple hook instances share the same data
let cachedItems: WishlistItem[] | null = null;

function loadFromStorage(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Version check — wipe stale data if schema changes
    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed.items ?? [];
  } catch {
    return [];
  }
}

function saveToStorage(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, items }));
  } catch {
    // Storage full or blocked — fail silently
  }
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    // Initialize from cache if available, otherwise from localStorage
    if (cachedItems !== null) return cachedItems;
    cachedItems = loadFromStorage();
    return cachedItems;
  });

  useEffect(() => {
    // Sync cache on mount (handles SSR hydration or tab switches)
    if (cachedItems === null) {
      cachedItems = loadFromStorage();
      setItems(cachedItems);
    }
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((current) => {
      const exists = current.some((i) => i.id === item.id);
      const next = exists
        ? current.filter((i) => i.id !== item.id)
        : [...current, item];
      cachedItems = next;
      saveToStorage(next);
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
      cachedItems = next;
      saveToStorage(next);
      return next;
    });
  }, []);

  return { items, toggle, isWishlisted, remove };
}
