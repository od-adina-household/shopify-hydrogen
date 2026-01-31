import { Image } from '@shopify/hydrogen';
import type { ProductVariantFragment } from 'storefrontapi.generated';
import { AspectRatio } from '~/components/ui/aspect-ratio';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export function ProductImage({
  image,
  badge,
}: {
  image: ProductVariantFragment['image'];
  badge?: { label: string; variant?: 'default' | 'secondary' | 'destructive' };
}) {
  if (!image) {
    return (
      <Card className="rounded-none">
        <CardContent className="p-0">
          <AspectRatio ratio={3 / 4}>
            <Skeleton className="h-full w-full rounded-none" />
          </AspectRatio>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="group overflow-hidden p-0 rounded-none">
      <CardContent className="relative p-0">
        {badge && (
          <Badge
            variant={badge.variant || 'default'}
            className="absolute right-2 top-2 z-10"
          >
            {badge.label}
          </Badge>
        )}
        <AspectRatio ratio={3 / 4}>
          <Image
            alt={image.altText || 'Product Image'}
            aspectRatio="3/4"
            data={image}
            key={image.id}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (min-width: 1024px) 25vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 max-w-full max-h-full"
          />
        </AspectRatio>
      </CardContent>
    </Card>
  );
}
