import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { Link, useRouteLoaderData } from 'react-router'
// import { MessageCircle, Download, Building2 } from 'lucide-react';
import { Button } from '~/components/ui/button'
import { useStaggerFadeIn } from '~/hooks/useStaggerFadeIn'
import { gsap, useGSAP } from '~/lib/gsap'
import { organizationJsonLd, websiteJsonLd } from '~/lib/seo'
import type { RootLoader } from '~/root'
import type { Route } from './+types/($locale)._index'

export const meta: Route.MetaFunction = ({ data }) => {
  const rootData = data as unknown as
    | {
        header?: {
          shop?: { name?: string; description?: string; primaryDomain?: { url?: string } }
        }
      }
    | undefined
  const shopName = rootData?.header?.shop?.name || 'Adina Household'
  const description =
    rootData?.header?.shop?.description ||
    'Discover beautiful objects for your home — curated ceramics, tableware, and drinkware for modern living.'
  const url = rootData?.header?.shop?.primaryDomain?.url || ''
  const imageUrl = url ? `${url}/favicon.jpg` : '/favicon.jpg'

  return [
    { title: shopName },
    { name: 'description', content: description },
    { rel: 'canonical', href: '/' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: shopName },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: imageUrl },
    { property: 'og:site_name', content: shopName },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: shopName },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ]
}

export async function loader(_args: Route.LoaderArgs) {
  return {}
}

export default function Homepage() {
  const rootData = useRouteLoaderData<RootLoader>('root')
  const shopName = rootData?.header?.shop?.name || 'Adina Household'
  const url = rootData?.header?.shop?.primaryDomain?.url || ''
  const searchUrl = url ? `${url}/search?q={search_term_string}` : '/search?q={search_term_string}'

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd({ name: shopName, url })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd({ name: shopName, url, searchUrl })),
        }}
      />

      <div className="w-full">
        <HeroSection />
        <IntroSection
          text="Let us guide you in the art of living — we bring ambience to your home with objects that inspire."
          buttonLabel="COLLECTION 25-26"
          buttonHref="/collections/all"
        />
        <CollectionCardsSection
          cards={[
            {
              title: 'CERAMICS',
              imageSrc: '/images/ceramics.jpeg',
              imageAlt: 'Ceramics collection',
              href: '/collections/ceramics',
            },
            {
              title: 'TABLEWARE',
              imageSrc: '/images/tableware.jpeg',
              imageAlt: 'Tableware collection',
              href: '/collections/tableware',
            },
            {
              title: 'DRINKWARE',
              imageSrc: '/images/drinkware.jpeg',
              imageAlt: 'Drinkware collection',
              href: '/collections/drinkware',
            },
          ]}
        />
        <SplitSection
          title="Storage with intention"
          imageSrc="/images/storageware.jpeg"
          imageAlt="Storage sets and containers"
          imageOnRight
          description="From ceramic jars to glass containers, this collection brings order and beauty together. Thoughtfully designed storage pieces that keep your essentials organized while adding character to your kitchen, bathroom, or living spaces. Functional objects that deserve to be displayed."
          ctaLabel="DISCOVER COLLECTION"
          ctaHref="/collections/storage"
        />
        {/* <IntroSection
        text="Our most expressive collection — for everyone who dares to live with imagination."
        buttonLabel="COLLECTION 25-26"
        buttonHref="/collections/collection-25-26"
      />
      <CollectionCardsSection
        cards={[
          {
            title: 'ART',
            imageSrc: '/images/art.jpeg',
            imageAlt: 'Decorative art piece',
            href: '/collections/art',
          },
          {
            title: 'TABLEWARE',
            imageSrc: '/images/tableware.jpeg',
            imageAlt: 'Artisan tableware',
            href: '/collections/tableware',
          },
          {
            title: 'LIVING',
            imageSrc: '/images/living.jpeg',
            imageAlt: 'Living room scene',
            href: '/collections/living',
          },
        ]}
      /> */}
        {/* <SplitSection
        title="Cool in chrome"
        imageSrc="/images/chrome.jpeg"
        imageAlt="Chrome decorative piece"
        imageOnRight={false}
        description="Whether wrapped around a light, formed into a tray or cast as a fully chromed bowl, it changes the mood of a space. Cool, sleek and unexpected — these accents catch the light and sharpen the atmosphere with their quiet intensity."
        ctaLabel="NEW CLASSICS"
        ctaHref="/collections/chrome"
      /> */}
        {/* <InfoColumnsSection /> */}
      </div>
    </>
  )
}

interface IntroSectionProps {
  text: string
  buttonLabel: string
  buttonHref: string
}

function IntroSection({ text, buttonLabel, buttonHref }: IntroSectionProps) {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-snug md:leading-relaxed font-serif font-normal text-foreground text-left max-w-4xl pt-16 md:pt-24 pb-6 md:pb-8">
          {text}
        </h2>
        <Button
          variant="outline"
          size="lg"
          className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 rounded-none px-8 tracking-widest uppercase text-xs sm:text-sm font-semibold h-12 sm:h-14 mb-8 md:mb-12"
          asChild
        >
          <Link to={buttonHref}>{buttonLabel}</Link>
        </Button>
      </div>
    </section>
  )
}
interface CollectionCard {
  title: string
  imageSrc: string
  imageAlt: string
  href: string
}

function CollectionCardsSection({ cards }: { cards: CollectionCard[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useStaggerFadeIn(sectionRef as React.RefObject<HTMLElement | null>, {
    selector: '.collection-card',
    stagger: 0.1,
    duration: 0.7,
    startY: 30,
  })

  return (
    <section ref={sectionRef} className="w-full pt-2 pb-4 md:pb-6 lg:pb-8 px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.href}
            className="collection-card relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[3/4] overflow-hidden group block w-full bg-background md:bg-transparent"
          >
            <img
              src={card.imageSrc}
              alt={card.imageAlt}
              className="h-full w-full object-cover transition-all duration-700 group-hover:opacity-90 md:group-hover:opacity-100 md:group-hover:scale-105 max-w-full max-h-full"
            />
            <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 md:bottom-8 md:right-8">
              <div className="flex items-center justify-between md:justify-start gap-3 px-5 py-3 bg-primary/80 backdrop-blur-sm border border-primary/20 transition-all duration-300 group-hover:bg-primary w-fit">
                <span className="text-sm font-medium tracking-wider text-primary-foreground uppercase">
                  {card.title}
                </span>
                <ArrowRight className="h-4 w-4 text-primary-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function HeroSection() {
  const text =
    'A collection that feels both curated and created — where every object carries intention.'
  const words = text.split(' ')
  const heroRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        context => {
          const { reduceMotion } = context.conditions!

          // Stagger word animation
          gsap.fromTo(
            '.hero-word',
            {
              opacity: reduceMotion ? 1 : 0,
              y: reduceMotion ? 0 : 30,
            },
            {
              opacity: 1,
              y: 0,
              duration: reduceMotion ? 0 : 0.8,
              ease: 'power2.out',
              stagger: reduceMotion ? 0 : 0.06,
              delay: reduceMotion ? 0 : 0.3,
            }
          )

          // Button fade-in
          if (buttonRef.current) {
            gsap.fromTo(
              buttonRef.current,
              {
                opacity: reduceMotion ? 1 : 0,
                y: reduceMotion ? 0 : 20,
              },
              {
                opacity: 1,
                y: 0,
                duration: reduceMotion ? 0 : 0.6,
                ease: 'power2.out',
                delay: reduceMotion ? 0 : 1.2,
              }
            )
          }
        }
      )
    },
    { scope: heroRef.current ?? undefined }
  )

  return (
    <section
      ref={heroRef}
      className="relative h-[70vh] md:h-[75vh] lg:h-[85vh] xl:h-[90vh] w-full overflow-hidden pt-20 md:pt-24"
    >
      <div className="absolute inset-0">
        <img
          src="/images/hero-image.jpeg"
          alt="White ceramic dishes with gold accents, dried flowers, and greenery arranged on neutral background"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/40 to-transparent" />
      </div>
      <div className="relative h-full flex items-center">
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 space-y-6 md:space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="h-px w-8 md:w-12 bg-amber-50/50" />
                <span className="text-xs md:text-sm tracking-widest uppercase text-amber-50/70 font-sans">
                  Curated
                </span>
              </div>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight text-amber-50 max-w-2xl"
                style={{ textWrap: 'balance' }}
              >
                {words.map((word, index) => (
                  <span key={index}>
                    <span className="hero-word inline-block">{word}</span>
                    {index < words.length - 1 && ' '}
                  </span>
                ))}
              </h1>
            </div>
            <div ref={buttonRef}>
              <Button
                variant="outline"
                size="lg"
                className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 rounded-none px-8 tracking-widest uppercase text-xs sm:text-sm font-semibold h-12 sm:h-14"
                asChild
              >
                <Link to="/collections/all">Shop now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
interface SplitSectionProps {
  title: string
  imageSrc: string
  imageAlt: string
  imageOnRight: boolean
  description?: string
  ctaLabel?: string
  ctaHref?: string
}

function SplitSection({
  title,
  imageSrc,
  imageAlt,
  imageOnRight,
  description,
  ctaLabel,
  ctaHref,
}: SplitSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        context => {
          const { reduceMotion } = context.conditions!

          // Image scale reveal
          if (imageRef.current) {
            gsap.fromTo(
              imageRef.current,
              {
                opacity: reduceMotion ? 1 : 0,
                scale: reduceMotion ? 1 : 0.95,
              },
              {
                opacity: 1,
                scale: 1,
                duration: reduceMotion ? 0 : 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: 'top+=80 bottom',
                  toggleActions: 'play none none none',
                  once: true,
                },
              }
            )
          }

          // Text slide in
          if (contentRef.current) {
            gsap.fromTo(
              contentRef.current,
              {
                opacity: reduceMotion ? 1 : 0,
                x: reduceMotion ? 0 : imageOnRight ? -30 : 30,
              },
              {
                opacity: 1,
                x: 0,
                duration: reduceMotion ? 0 : 0.7,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: 'top+=80 bottom',
                  toggleActions: 'play none none none',
                  once: true,
                },
              }
            )
          }
        }
      )
    },
    { scope: sectionRef.current ?? undefined }
  )

  const textContent = (
    <div
      ref={contentRef}
      className="flex flex-col justify-center h-full px-6 sm:px-10 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20"
    >
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-serif font-normal text-foreground leading-tight mb-6 md:mb-8 italic">
        {title}
      </h2>
      {description && (
        <p className="text-foreground font-sans text-sm md:text-base leading-relaxed max-w-md mb-8 md:mb-10">
          {description}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <Button
          variant="outline"
          size="lg"
          className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 rounded-none px-8 tracking-widest uppercase text-xs sm:text-sm font-semibold h-12 sm:h-14 w-fit"
          asChild
        >
          <Link to={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  )

  const imageContent = (
    <div
      ref={imageRef}
      className="h-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px]"
    >
      {ctaHref ? (
        <Link to={ctaHref} className="block h-full w-full">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover max-w-full max-h-full"
          />
        </Link>
      ) : (
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover max-w-full max-h-full"
        />
      )}
    </div>
  )

  return (
    <section ref={sectionRef} className="w-full bg-secondary">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {imageOnRight ? (
          <>
            <div className="bg-secondary">{textContent}</div>
            <div className="relative">{imageContent}</div>
          </>
        ) : (
          <>
            <div className="relative order-2 md:order-1">{imageContent}</div>
            <div className="bg-background order-1 md:order-2">{textContent}</div>
          </>
        )}
      </div>
    </section>
  )
}

// function InfoColumnsSection() {
//   return (
//     <section className="py-16 md:py-24 bg-background">
//       <div className="container mx-auto px-6 md:px-8 lg:px-12 max-w-7xl">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
//           {/* Do you need some help? */}
//           <div className="space-y-4">
//             <h3 className="text-lg md:text-2xl font-serif font-normal text-foreground">
//               Do you need some help?
//             </h3>
//             <div className="flex items-start gap-4">
//               <MessageCircle className="w-5 h-5 md:w-6 md:h-6 mt-1 text-foreground flex-shrink-0" strokeWidth={1.5} />
//               <p className="text-sm md:text-base text-foreground leading-relaxed">
//                 Our customer service team will be happy to assist you, please click{' '}
//                 <Link to="/pages/contact" className="underline underline-offset-2 hover:no-underline font-medium">
//                   here
//                 </Link>{' '}
//                 to get in touch with us.
//               </p>
//             </div>
//           </div>

//           {/* Arrange it yourself */}
//           <div className="space-y-4">
//             <h3 className="text-lg md:text-2xl font-serif font-normal text-foreground">
//               Arrange it yourself
//             </h3>
//             <div className="space-y-4">
//               <Link to="/pages/pressroom" className="flex items-center gap-4 text-sm md:text-base text-foreground hover:underline group">
//                 <Download className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform group-hover:translate-y-1" strokeWidth={1.5} />
//                 Download pressroom packages
//               </Link>
//               <Link to="/pages/become-a-dealer" className="flex items-center gap-4 text-sm md:text-base text-foreground hover:underline group">
//                 <Building2 className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform group-hover:scale-105" strokeWidth={1.5} />
//                 Become a dealer
//               </Link>
//             </div>
//           </div>

//           {/* Got some questions? */}
//           <div className="space-y-4">
//             <h3 className="text-lg md:text-2xl font-serif font-normal text-foreground">
//               Got some questions?
//             </h3>
//             <Link to="/pages/stores" className="flex items-center gap-4 text-sm md:text-base text-foreground hover:underline group">
//               <MessageCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform group-hover:scale-105" strokeWidth={1.5} />
//               Where can I buy AD Household?
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

const _RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
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
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const
