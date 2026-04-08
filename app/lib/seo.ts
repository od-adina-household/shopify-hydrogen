import type { ProductFragment } from 'storefrontapi.generated';

interface ProductJsonLdProps {
  product: ProductFragment;
  url: string;
}

export function productJsonLd({ product, url }: ProductJsonLdProps) {
  const selectedVariant = product.selectedOrFirstAvailableVariant;
  const image = product.featuredImage
    ? {
        '@type': 'ImageObject' as const,
        url: product.featuredImage.url,
      }
    : undefined;

  const offers = selectedVariant
    ? {
        '@type': 'Offer' as const,
        price: selectedVariant.price.amount,
        priceCurrency: selectedVariant.price.currencyCode,
        availability: selectedVariant.availableForSale
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url,
        sku: selectedVariant.sku || undefined,
      }
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product' as const,
    name: product.title,
    description: product.seo?.description || product.description || undefined,
    image: image ? [image] : undefined,
    brand: {
      '@type': 'Brand' as const,
      name: product.vendor,
    },
    offers: offers ? [offers] : undefined,
    url,
  };
}

interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logoUrl?: string;
}

export function organizationJsonLd({ name, url, logoUrl }: OrganizationJsonLdProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization' as const,
    name,
    url,
    logo: logoUrl ? { '@type': 'ImageObject' as const, url: logoUrl } : undefined,
  };
}

interface BreadcrumbJsonLdItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbJsonLdItem[];
}

export function breadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface WebSiteJsonLdProps {
  name: string;
  url: string;
  searchUrl?: string;
}

export function websiteJsonLd({ name, url, searchUrl }: WebSiteJsonLdProps) {
  const base = {
    '@context': 'https://schema.org',
    '@type': 'WebSite' as const,
    name,
    url,
  };

  if (searchUrl) {
    return {
      ...base,
      potentialAction: {
        '@type': 'SearchAction' as const,
        target: searchUrl,
        'query-input': 'required name=search_term_string',
      },
    };
  }

  return base;
}
