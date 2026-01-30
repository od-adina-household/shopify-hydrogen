import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
  Image,
} from '@shopify/hydrogen';
import {
  CheckIcon,
  PackageIcon,
  RotateCcwIcon,
  TruckIcon,
  Share2,
  Mail,
  Facebook,
  Twitter,
  ChevronRight,
} from 'lucide-react';
import { Suspense, useState, useEffect } from 'react';
import { Await, Link, useLoaderData } from 'react-router';
import type { 
  ProductVariantFragment, 
  ProductFragment, 
  ProductRecommendationsQuery,
  FallbackProductsQuery
} from 'storefrontapi.generated';
import { ProductForm } from '~/components/ProductForm';
import { ProductPrice } from '~/components/ProductPrice';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '~/components/ui/carousel';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import type { Route } from './+types/products.$handle';

export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: `Hydrogen | ${data?.product.title ?? ''}` },
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args, criticalData.product.id);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context, params, request }: Route.LoaderArgs) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{ product }] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: { handle, selectedOptions: getSelectedProductOptions(request) },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, { handle, data: product });

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: Route.LoaderArgs, productId: string) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  const { storefront } = context;

  const relatedProducts = Promise.all([
    storefront
      .query(RECOMMENDED_PRODUCTS_QUERY, {
        variables: { productId },
      })
      .catch((error: Error) => {
        console.error(error);
        return null;
      }),
    storefront
      .query(FALLBACK_PRODUCTS_QUERY)
      .catch((error: Error) => {
        console.error(error);
        return null;
      }),
  ]);

  return {
    relatedProducts,
  };
}

export default function Product() {
  const { product, relatedProducts } = useLoaderData<typeof loader>();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const { title, descriptionHtml, description, images } = product;
  const productImages = images.nodes.length > 0 ? images.nodes : selectedVariant?.image ? [selectedVariant.image] : [];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="relative min-h-screen bg-[#F0EBDE]">
      <div className="mx-auto max-w-[1920px]">
        <div className="flex flex-col lg:flex-row relative">
          {/* Left Column - Sticky Carousel */}
          <div className="w-full lg:w-[calc(100%-480px)] xl:w-[calc(100%-550px)] lg:sticky lg:top-[70px] lg:h-[calc(100vh-70px)] bg-[#fafafa] overflow-hidden">
            <Carousel setApi={setApi} className="w-full h-full relative">
              <CarouselContent className="h-[500px] lg:h-full">
                {productImages.map((image: any, index: number) => (
                  <CarouselItem key={image.id || index} className="w-full h-full flex items-center justify-center p-0">
                    <div className="relative w-full h-full flex items-center justify-center bg-[#fafafa]">
                      <Image
                        data={image}
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
                {productImages.length === 0 && (
                  <CarouselItem className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {productImages.length > 1 && (
                <>
                  <div className="absolute left-0 top-0 bottom-0 w-[75px] flex items-center justify-center pointer-events-none">
                     <div className="pointer-events-auto">
                        <CarouselPrevious className="static translate-y-0 h-12 w-12 bg-white/80 hover:bg-white shadow-md [&_svg]:size-6 text-[#3c281e]" />
                     </div>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-[75px] flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                        <CarouselNext className="static translate-y-0 h-12 w-12 bg-white/80 hover:bg-white shadow-md [&_svg]:size-6 text-[#3c281e]" />
                    </div>
                  </div>
                </>
              )}
            </Carousel>
            {productImages.length > 0 && (
              <div className="absolute bottom-10 left-10 text-[26px] font-normal font-sans text-[#3c281e]">
                {current} / {count}
              </div>
            )}
          </div>

          {/* Right Column - Scrollable Content */}
          <div className="w-full lg:w-[480px] xl:w-[550px] bg-[#F0EBDE] px-6 py-10 lg:px-8 lg:py-12 flex flex-col min-h-screen">
            
            {/* Breadcrumb */}
            <div className="mb-8">
              <Breadcrumb>
                <BreadcrumbList className="text-[#a47d44] text-xs uppercase tracking-wider">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/products" className="hover:text-[#3c281e]">All Products</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#" className="hover:text-[#3c281e]">Kitchen</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[#a47d44]">Artist ceramics</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Social Share */}
            <div className="flex justify-end gap-2 mb-8">
               <button className="p-2 hover:bg-[#d6c4ad]/20 rounded-full transition-colors"><Mail className="w-4 h-4 text-[#3c281e]" /></button>
               <button className="p-2 hover:bg-[#d6c4ad]/20 rounded-full transition-colors"><Share2 className="w-4 h-4 text-[#3c281e]" /></button>
               <button className="p-2 hover:bg-[#d6c4ad]/20 rounded-full transition-colors"><div className="w-4 h-4 border border-[#3c281e] rounded-full flex items-center justify-center text-[10px] font-bold text-[#3c281e]">P</div></button>
               <button className="p-2 hover:bg-[#d6c4ad]/20 rounded-full transition-colors"><Twitter className="w-4 h-4 text-[#3c281e]" /></button>
               <button className="p-2 hover:bg-[#d6c4ad]/20 rounded-full transition-colors"><Facebook className="w-4 h-4 text-[#3c281e]" /></button>
            </div>

            {/* Product Title & Info */}
            <div className="mb-12">
              <h1 className="text-[56px] leading-[1.1] font-normal text-[#3c281e] mb-2 font-serif">
                {title}
              </h1>
              {selectedVariant?.title && selectedVariant.title !== 'Default Title' && (
                <p className="text-[27px] leading-none text-[#3c281e] mb-4 font-sans">
                  {selectedVariant.title}
                </p>
              )}
              {selectedVariant?.sku && (
                <p className="text-sm text-[#3c281e] font-sans">
                  {selectedVariant.sku}
                </p>
              )}
            </div>

            {/* Accordions */}
            <div className="space-y-0 border-t border-[#d6c4ad]">
              <Accordion type="single" collapsible className="w-full" defaultValue="description">
                <AccordionItem value="description" className="border-b border-[#d6c4ad]">
                  <AccordionTrigger className="text-[24px] font-normal text-[#3c281e] py-6 hover:no-underline font-serif text-left">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="text-[12.5px] leading-7 text-[#212529] font-sans pb-6">
                    {descriptionHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                    ) : (
                      description
                    )}
                    
                    <div className="mt-6 pt-4">
                        <ProductPrice
                          price={selectedVariant?.price}
                          compareAtPrice={selectedVariant?.compareAtPrice}
                          className="text-lg font-medium text-[#3c281e] mb-4 block"
                        />
                         <ProductForm
                            productOptions={productOptions}
                            selectedVariant={selectedVariant}
                          />
                    </div>

                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="general" className="border-b border-[#d6c4ad]">
                  <AccordionTrigger className="text-[24px] font-normal text-[#3c281e] py-6 hover:no-underline font-serif text-left">
                    General
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#3c281e] pb-6">
                     <p>General specifications go here.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="dimensions" className="border-b border-[#d6c4ad]">
                  <AccordionTrigger className="text-[24px] font-normal text-[#3c281e] py-6 hover:no-underline font-serif text-left">
                    Dimensions
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#3c281e] pb-6">
                     <p>Product dimensions go here.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="care" className="border-b border-[#d6c4ad]">
                  <AccordionTrigger className="text-[24px] font-normal text-[#3c281e] py-6 hover:no-underline font-serif text-left">
                    Care & Maintenance Instructions
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#3c281e] pb-6">
                     <p>Care instructions go here.</p>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="downloads" className="border-b border-[#d6c4ad]">
                  <AccordionTrigger className="text-[24px] font-normal text-[#3c281e] py-6 hover:no-underline font-serif text-left">
                    Downloads
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#3c281e] pb-6">
                     <p>Downloadable content goes here.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        <div className="bg-[#f0ebde] px-6 py-16 lg:px-8 border-t border-[#d6c4ad]">
           <Suspense fallback={<RelatedProductsSkeleton />}>
            <Await resolve={relatedProducts}>
              {(data: [ProductRecommendationsQuery | null, FallbackProductsQuery | null]) => {
                const recommendationsData = data[0];
                const fallbackData = data[1];
                const recommendations = recommendationsData?.productRecommendations || [];
                const fallbackProducts = fallbackData?.products?.nodes || [];
                const allProducts = [...recommendations];
                const currentProductId = product.id;
                for (const fallbackProduct of fallbackProducts) {
                  if (allProducts.length >= 4) break;
                  if (
                    fallbackProduct.id !== currentProductId &&
                    !allProducts.find(p => p.id === fallbackProduct.id)
                  ) {
                    allProducts.push(fallbackProduct);
                  }
                }
                const displayProducts = allProducts.slice(0, 4);
                return <RelatedProducts products={displayProducts} />;
              }}
            </Await>
          </Suspense>
        </div>

        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

function RelatedProducts({
  products,
}: {
  products: any[];
}) {
  if (!products || products.length === 0) return null;

  return (
    <section>
      <div className="mb-10 text-center">
        <h2 className="text-[33px] font-normal font-serif text-[#3c281e]">
          You might also like these
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-[#fafafa] border border-[#f0ebde] p-4 group">
            <Link prefetch="intent" to={`/products/${product.handle}`} className="block relative aspect-[4/5] mb-4 overflow-hidden">
               {product.featuredImage && (
                 <Image
                   data={product.featuredImage}
                   className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                   sizes="(min-width: 1024px) 25vw, 50vw"
                 />
               )}
            </Link>
            <div className="space-y-2">
               <h3 className="text-[23px] font-medium leading-[28px] text-[#3c281e] font-sans">
                 {product.title}
               </h3>
               <div className="flex justify-between items-end">
                  <p className="text-[14px] text-[#3c281e] font-sans">
                    {product.variants?.nodes?.[0]?.sku || 'KCT0015'}
                  </p>
                  <button className="w-6 h-6 rounded-full border border-[#3c281e] flex items-center justify-center text-[#3c281e] hover:bg-[#3c281e] hover:text-white transition-colors">
                     <span className="sr-only">Add to cart</span>
                     <span className="text-lg leading-none mb-1">+</span>
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
       <div className="flex justify-end gap-3 mt-8">
         <button className="w-10 h-10 flex items-center justify-center hover:bg-[#d6c4ad]/20 rounded-full">
            <ChevronRight className="rotate-180 w-5 h-5 text-[#3c281e]" />
         </button>
         <button className="w-10 h-10 flex items-center justify-center hover:bg-[#d6c4ad]/20 rounded-full">
            <ChevronRight className="w-5 h-5 text-[#3c281e]" />
         </button>
       </div>
    </section>
  );
}

function RelatedProductsSkeleton() {
  return (
    <section className="pt-16">
      <div className="mb-8 text-center">
        <Skeleton className="h-8 w-64 mx-auto bg-[#d6c4ad]/50" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
          <div key={key} className="space-y-4 p-4 border border-[#f0ebde] bg-[#fafafa]">
            <Skeleton className="aspect-[4/5] w-full bg-[#d6c4ad]/30" />
            <Skeleton className="h-6 w-3/4 bg-[#d6c4ad]/30" />
            <Skeleton className="h-4 w-1/4 bg-[#d6c4ad]/30" />
          </div>
        ))}
      </div>
    </section>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query ProductRecommendations(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      availableForSale
      collections(first: 5) {
        nodes {
          id
          title
          handle
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        id
        url
        altText
        width
        height
      }
      options {
        name
        optionValues {
          name
        }
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          sku
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
` as const;

const FALLBACK_PRODUCTS_QUERY = `#graphql
  query FallbackProducts(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        availableForSale
        collections(first: 5) {
          nodes {
            id
            title
            handle
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          id
          url
          altText
          width
          height
        }
        options {
          name
          optionValues {
            name
          }
        }
        variants(first: 100) {
          nodes {
            id
            title
            availableForSale
            sku
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
` as const;