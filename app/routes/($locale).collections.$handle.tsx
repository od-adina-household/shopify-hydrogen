import { Analytics, getPaginationVariables } from '@shopify/hydrogen'
import { useRef } from 'react'
import { redirect, useLoaderData } from 'react-router'
import type { ProductItemFragment } from 'storefrontapi.generated'
import { PaginatedResourceSection } from '~/components/PaginatedResourceSection'
import { ProductItem } from '~/components/ProductItem'
import { useStaggerFadeIn } from '~/hooks/useStaggerFadeIn'
import { redirectIfHandleIsLocalized } from '~/lib/redirect'
import type { Route } from './+types/($locale).collections.$handle'

export const meta: Route.MetaFunction = ({ data, params }) => {
  const collection = data?.collection
  const seoTitle = collection?.seo?.title || collection?.title
  const seoDescription = collection?.seo?.description
  const handle = collection?.handle || params.handle

  return [
    { title: seoTitle ?? 'Collection' },
    { name: 'description', content: seoDescription },
    { rel: 'canonical', href: `/collections/${handle}` },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:url', content: `/collections/${handle}` },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: seoTitle },
    { name: 'twitter:description', content: seoDescription },
  ]
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args)

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args)

  return { ...deferredData, ...criticalData }
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context, params, request }: Route.LoaderArgs) {
  const { handle } = params
  const { storefront } = context
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  })

  if (!handle) {
    throw redirect('/collections')
  }

  const [{ collection }] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: { handle, ...paginationVariables },
      // Add other queries here, so that they are loaded in parallel
    }),
  ])

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    })
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, { handle, data: collection })

  return {
    collection,
  }
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: Route.LoaderArgs) {
  return {}
}

export default function Collection() {
  const { collection } = useLoaderData<typeof loader>()
  const productCount = collection.products?.nodes?.length ?? 0
  const gridRef = useRef<HTMLDivElement>(null)

  useStaggerFadeIn(gridRef as React.RefObject<HTMLElement | null>, {
    selector: '.product-item',
    stagger: 0.06,
    duration: 0.5,
    startY: 16,
  })

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12 mt-20 md:mt-24">
      <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">{collection.title}</h1>
          <p className="text-muted-foreground min-h-[24px]">
            {productCount === 0
              ? 'No products found'
              : `Showing ${productCount} product${productCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div ref={gridRef}>
          <PaginatedResourceSection<ProductItemFragment>
            connection={collection.products}
            resourcesClassName="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 md:gap-x-8 md:gap-y-10 lg:gap-x-10 lg:gap-y-12"
          >
            {({ node: product, index }) => (
              <div className="product-item">
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 8 ? 'eager' : undefined}
                />
              </div>
            )}
          </PaginatedResourceSection>
        </div>
        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      </div>
    </div>
  )
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    availableForSale
    collections(first: 5) {
      nodes {
        id
        title
        handle
      }
    }
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
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
` as const

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        title
        description
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const
