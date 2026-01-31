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
  ArrowLeft,
  ArrowRight,
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
    { title: data?.product.title ?? 'Product' },
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
        <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12 relative lg:px-8 xl:px-12">
          {/* Left Column - Image Carousel */}
          <div className="w-full lg:w-[55%] bg-[#F0EBDE] flex flex-col">
            <div className="relative min-h-48 sm:min-h-64 md:min-h-80 lg:min-h-[50vh] xl:min-h-[60vh] max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] lg:max-h-[65vh] xl:max-h-[75vh]">
              <Carousel setApi={setApi} className="w-full h-full" opts={{ loop: true }}>
                <CarouselContent className="h-full ml-0">
                  {productImages.map((image: any, index: number) => (
                    <CarouselItem key={image.id || index} className="w-full h-full flex items-center justify-center p-0 pl-0">
                      <div className="relative w-full h-full flex items-center justify-center bg-[#F0EBDE] min-h-48 sm:min-h-64 md:min-h-80 lg:min-h-[50vh] xl:min-h-[60vh] max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] lg:max-h-[65vh] xl:max-h-[75vh]">
                        <Image
                          data={image}
                          sizes="(min-width: 1024px) 55vw, 100vw"
                          className="size-full object-contain mix-blend-multiply max-w-full max-h-full"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                  {productImages.length === 0 && (
                    <CarouselItem className="w-full h-full flex items-center justify-center pl-0">
                      <div className="w-full h-full bg-[#F0EBDE] flex items-center justify-center text-gray-400 min-h-64 sm:min-h-80 lg:min-h-[50vh] xl:min-h-[60vh]">
                        No Image Available
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>

                {productImages.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white hover:bg-white/90 border-none shadow-md text-[#3c281e] p-0 flex items-center justify-center rounded-full cursor-pointer z-10 transition-all" aria-label="Previous image">
                        <ArrowLeft className="size-4 sm:size-5 stroke-[1.5px]" />
                    </CarouselPrevious>
                    <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white hover:bg-white/90 border-none shadow-md text-[#3c281e] p-0 flex items-center justify-center rounded-full cursor-pointer z-10 transition-all" aria-label="Next image">
                        <ArrowRight className="size-4 sm:size-5 stroke-[1.5px]" />
                    </CarouselNext>
                  </>
                )}
              </Carousel>

              {productImages.length > 0 && (
                <div className="absolute bottom-4 sm:bottom-5 left-3 sm:left-4 text-base sm:text-lg font-normal font-sans text-[#3c281e] leading-none z-10 px-2 py-1 rounded">
                  {current} / {count}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {productImages.length > 1 && (
              <div className="flex gap-2 mt-4 px-4 lg:px-0 overflow-x-auto pb-2">
                {productImages.map((image: any, index: number) => (
                  <button
                    key={image.id || index}
                    onClick={() => api?.scrollTo(index)}
                    aria-label={`View image ${index + 1} of ${productImages.length}`}
                    aria-current={current === index + 1 ? 'true' : 'false'}
                    className={`flex-shrink-0 size-12 sm:size-14 md:size-16 lg:size-20 border-2 transition-all ${
                      current === index + 1
                        ? 'border-[#3c281e] shadow-md'
                        : 'border-[#3c281e]/20 hover:border-[#3c281e]/50'
                    }`}
                  >
                    <Image
                      data={image}
                      sizes="80px"
                      className="size-full object-cover mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Information */}
          <div className="w-full lg:w-[45%] bg-[#F0EBDE] px-6 py-10 lg:px-0 lg:py-12 flex flex-col">
            
            {/* Breadcrumb */}
            <div className="mb-8 lg:mb-12">
              <Breadcrumb>
                <BreadcrumbList className="text-sm sm:text-base text-[#3c281e] font-sans">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/products" className="hover:opacity-70 transition-opacity text-[#a47d44]">All Products</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-[#3c281e]/50">
                    <ChevronRight className="size-3 sm:size-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#" className="hover:opacity-70 transition-opacity text-[#a47d44]">Kitchen</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-[#3c281e]/50">
                    <ChevronRight className="size-3 sm:size-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[#a47d44]">Artist ceramics</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Social Share */}
            <div className="flex justify-end gap-3 sm:gap-4 mb-8 lg:mb-12">
               <button className="hover:opacity-70 transition-opacity"><Mail className="size-4 sm:size-5 text-[#3c281e]" /></button>
               <button className="hover:opacity-70 transition-opacity"><Share2 className="size-4 sm:size-5 text-[#3c281e]" /></button>
               <button className="hover:opacity-70 transition-opacity"><div className="size-4 sm:size-5 border border-[#3c281e] rounded-full flex items-center justify-center text-xs font-bold text-[#3c281e]">P</div></button>
               <button className="hover:opacity-70 transition-opacity"><Twitter className="size-4 sm:size-5 text-[#3c281e]" /></button>
               <button className="hover:opacity-70 transition-opacity"><Facebook className="size-4 sm:size-5 text-[#3c281e]" /></button>
            </div>

            {/* Product Title & Info */}
            <div className="mb-10 lg:mb-16">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight mb-4 lg:mb-6 font-serif font-normal text-[#3c281e]">
                {title}
              </h1>
              {selectedVariant?.title && selectedVariant.title !== 'Default Title' && (
                <p className="text-xl sm:text-2xl leading-tight text-[#3c281e] mb-4 font-sans font-light">
                  {selectedVariant.title}
                </p>
              )}
              {selectedVariant?.sku && (
                <p className="text-xs sm:text-sm text-[#3c281e] font-sans opacity-80 mb-8">
                  {selectedVariant.sku}
                </p>
              )}

              {/* Price and Add to Cart */}
              <div className="mt-8 pt-8 border-t border-[#3c281e]/10">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                  className="text-xl sm:text-2xl font-light text-[#3c281e] mb-6 block"
                />
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-0 border-t border-[#3c281e]/20">
              <Accordion type="single" collapsible className="w-full" defaultValue="description">
                <AccordionItem value="description" className="border-b border-[#3c281e]/20">
                  <AccordionTrigger className="text-xl sm:text-2xl font-normal text-[#3c281e] py-6 lg:py-8 hover:no-underline font-serif text-left pr-8">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-[#212529] font-sans pb-6 lg:pb-8 pr-4">
                    {descriptionHtml ? (
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                    ) : (
                      <p>{description}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="general" className="border-b border-[#3c281e]/20">
                  <AccordionTrigger className="text-xl sm:text-2xl font-normal text-[#3c281e] py-6 lg:py-8 hover:no-underline font-serif text-left pr-8">
                    General
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#3c281e] pb-6 lg:pb-8">
                     <p className="opacity-80">General specifications go here.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="dimensions" className="border-b border-[#3c281e]/20">
                  <AccordionTrigger className="text-xl sm:text-2xl font-normal text-[#3c281e] py-6 lg:py-8 hover:no-underline font-serif text-left pr-8">
                    Dimensions
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#3c281e] pb-6 lg:pb-8">
                     <p className="opacity-80">Product dimensions go here.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="care" className="border-b border-[#3c281e]/20">
                  <AccordionTrigger className="text-xl sm:text-2xl font-normal text-[#3c281e] py-6 lg:py-8 hover:no-underline font-serif text-left pr-8">
                    Care & Maintenance Instructions
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#3c281e] pb-6 lg:pb-8">
                     <p className="opacity-80">Care instructions go here.</p>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="downloads" className="border-b border-[#3c281e]/20">
                  <AccordionTrigger className="text-xl sm:text-2xl font-normal text-[#3c281e] py-6 lg:py-8 hover:no-underline font-serif text-left pr-8">
                    Downloads
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[#3c281e] pb-6 lg:pb-8">
                     <p className="opacity-80">Downloadable content goes here.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        <div className="bg-[#f0ebde] px-6 py-16 lg:py-20 lg:px-12 border-t border-[#3c281e]/10">
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
      <div className="mb-10 lg:mb-12 text-center lg:text-left">
        <h2 className="text-2xl sm:text-3xl font-normal font-serif text-[#3c281e]">
          You might also like these
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-[#3c281e]/5 p-4 sm:p-6 group transition-all hover:shadow-sm text-left">
            <Link prefetch="intent" to={`/products/${product.handle}`} className="block relative aspect-[4/5] sm:aspect-[3/4] mb-4 sm:mb-6 overflow-hidden bg-[#F0EBDE]">
               {product.featuredImage && (
                 <Image
                   data={product.featuredImage}
                   className="size-full object-cover mix-blend-multiply max-w-full max-h-full"
                   sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (min-width: 1024px) 25vw"
                 />
               )}
            </Link>
            <div className="space-y-2 sm:space-y-3">
               <h3 className="text-lg sm:text-xl font-medium leading-tight text-[#3c281e] font-sans">
                 {product.title}
               </h3>
               <div className="flex justify-between items-end pt-1 sm:pt-2">
                  <p className="text-xs sm:text-sm text-[#3c281e]/60 font-sans">
                    {product.variants?.nodes?.[0]?.sku || 'AAX0004'}
                  </p>
                  <button className="size-7 sm:size-8 rounded-full border border-[#3c281e] flex items-center justify-center text-[#3c281e] hover:bg-[#3c281e] hover:text-white transition-all">
                     <span className="sr-only">Add to cart</span>
                     <span className="text-lg sm:text-xl leading-none mb-1">+</span>
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
       <div className="flex justify-center lg:justify-end gap-3 sm:gap-4 mt-10 lg:mt-12">
         <button className="size-10 sm:size-12 flex items-center justify-center hover:bg-[#3c281e]/5 rounded-full transition-colors border border-[#3c281e]/10">
            <ChevronRight className="rotate-180 size-5 sm:size-6 text-[#3c281e]" />
         </button>
         <button className="size-10 sm:size-12 flex items-center justify-center hover:bg-[#3c281e]/5 rounded-full transition-colors border border-[#3c281e]/10">
            <ChevronRight className="size-5 sm:size-6 text-[#3c281e]" />
         </button>
       </div>
    </section>
  );
}

function RelatedProductsSkeleton() {
  return (
    <section className="py-16">
      <div className="mb-12">
        <Skeleton className="h-10 w-64 bg-[#3c281e]/10" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
          <div key={key} className="space-y-6 p-6 border border-[#3c281e]/5 bg-[#F0EBDE]">
            <Skeleton className="aspect-[4/5] w-full bg-[#3c281e]/5" />
            <Skeleton className="h-8 w-3/4 bg-[#3c281e]/5" />
            <Skeleton className="h-6 w-1/4 bg-[#3c281e]/5" />
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
