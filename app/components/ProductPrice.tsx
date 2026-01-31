import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';
import { Money } from '@shopify/hydrogen';
import { Badge } from '~/components/ui/badge';

export function ProductPrice({
  price,
  compareAtPrice,
  className,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
}) {
  const isOnSale = compareAtPrice && price && compareAtPrice.amount > price.amount;

  return (
    <div className="flex items-center gap-3">
      {compareAtPrice && isOnSale ? (
        <>
          <div className="flex items-baseline gap-2">
            <span className={className || "text-2xl font-bold text-foreground"}>
              {price ? <Money data={price} withoutTrailingZeros /> : null}
            </span>
            <s className="text-lg text-muted-foreground">
              <Money data={compareAtPrice} withoutTrailingZeros />
            </s>
          </div>
          <Badge variant="destructive">Sale</Badge>
        </>
      ) : price ? (
        <span className={className || "text-2xl font-bold text-foreground"}>
          <Money data={price} withoutTrailingZeros />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
