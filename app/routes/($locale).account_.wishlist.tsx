import { Link } from 'react-router';
import { useWishlist } from '~/lib/useWishlist';
import { Money } from '@shopify/hydrogen';
import { Heart, X } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function WishlistPage() {
  const { items, remove } = useWishlist();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 mt-20">
      <h1 className="text-3xl sm:text-4xl font-serif font-normal mb-12">Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-24 space-y-6">
          <Heart className="mx-auto size-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Button asChild variant="outline" className="uppercase tracking-widest text-xs">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-6 py-6">
              <Link to={`/products/${item.handle}`} className="flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image.url}
                    alt={item.image.altText ?? item.title}
                    className="size-20 sm:size-24 object-cover bg-muted"
                  />
                ) : (
                  <div className="size-20 sm:size-24 bg-muted" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.handle}`}
                  className="text-sm sm:text-base font-medium hover:underline truncate block"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  <Money data={item.price as unknown as { amount: string; currencyCode: import('@shopify/hydrogen/storefront-api-types').CurrencyCode }} />
                </p>
              </div>
              <button
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.title} from wishlist`}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
