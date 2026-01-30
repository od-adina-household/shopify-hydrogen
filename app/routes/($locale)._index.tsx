import { Link } from 'react-router';
import { ArrowRight, MessageCircle, Download, Building2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import type { Route } from './+types/_index';

export const meta: Route.MetaFunction = () => {
  return [{ title: 'Home' }];
};

export async function loader(args: Route.LoaderArgs) {
  return {};
}

export default function Homepage() {
  return (
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
            title: 'KITCHEN',
            imageSrc: '/images/shelf.jpg',
            imageAlt: 'Kitchen collection',
            href: '/collections/kitchen',
          },
          {
            title: 'ACCESSORIES',
            imageSrc: '/images/flowers.jpg',
            imageAlt: 'Accessories collection',
            href: '/collections/accessories',
          },
          {
            title: 'FURNITURE',
            imageSrc: '/images/interior.jpg',
            imageAlt: 'Furniture collection',
            href: '/collections/furniture',
          },
        ]}
      />
      <SplitSection
        title="Shaped by light"
        imageSrc="/images/lamps.jpeg"
        imageAlt="Decorative lamps and objects"
        imageOnRight
        description="Some lamps are made to adapt — others are made to lead. From table lamps to wall pieces, this collection plays with material, surface and light in bold, expressive ways. Ceramic, metal, plastic, textile and glass come together, each adding its own character. Use one as a statement, or let multiple pieces shape the atmosphere of a space."
        ctaLabel="DISCOVER COLLECTION"
        ctaHref="/collections/lighting"
      />
      <IntroSection
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
      />
      <SplitSection
        title="Cool in chrome"
        imageSrc="/images/chrome.jpeg"
        imageAlt="Chrome decorative piece"
        imageOnRight={false}
        description="Whether wrapped around a light, formed into a tray or cast as a fully chromed bowl, it changes the mood of a space. Cool, sleek and unexpected — these accents catch the light and sharpen the atmosphere with their quiet intensity."
        ctaLabel="NEW CLASSICS"
        ctaHref="/collections/chrome"
      />
      <InfoColumnsSection />
    </div>
  );
}

interface IntroSectionProps {
  text: string;
  buttonLabel: string;
  buttonHref: string;
}

function IntroSection({ text, buttonLabel, buttonHref }: IntroSectionProps) {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-snug md:leading-relaxed font-serif font-normal text-[#3C281E] text-left max-w-4xl pt-16 md:pt-24 pb-6 md:pb-8">
          {text}
        </h2>
        <Link
          to={buttonHref}
          className="inline-flex items-center gap-3 text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-[#3C281E] underline underline-offset-4 decoration-1 hover:no-underline transition-all duration-300 mb-8 md:mb-12"
        >
          {buttonLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
interface CollectionCard {
  title: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
}

function CollectionCardsSection({ cards }: { cards: CollectionCard[] }) {
  return (
    <section className="w-full px-2 sm:px-4 lg:px-6 pt-2 pb-4 md:pb-6 lg:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.href}
            className="relative aspect-[3/4] overflow-hidden group block"
          >
            <img
              src={card.imageSrc}
              alt={card.imageAlt}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 left-6 md:left-auto">
              <div className="flex items-center justify-between md:justify-start gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:bg-white">
                <span className="text-sm font-medium tracking-wider text-foreground uppercase">
                  {card.title}
                </span>
                <ArrowRight className="h-4 w-4 text-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/hero-image.jpg"
          alt="Curated home collection"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>
      <div className="relative h-full flex items-center">
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 space-y-6 md:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-white max-w-xl sm:max-w-2xl">
              A collection that feels both curated and created — where every object carries intention.
            </h1>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/90 hover:bg-white text-foreground border-white rounded-none px-8 tracking-widest uppercase text-xs sm:text-sm font-semibold h-12 sm:h-14"
              asChild
            >
              <Link to="/collections/all">
                Shop now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
interface SplitSectionProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
  imageOnRight: boolean;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

function SplitSection({ title, imageSrc, imageAlt, imageOnRight, description, ctaLabel, ctaHref }: SplitSectionProps) {
  const textContent = (
    <div className="flex flex-col justify-center h-full px-6 sm:px-10 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-serif font-normal text-[#3C281E] leading-tight mb-6 md:mb-8 italic">
        {title}
      </h2>
      {description && (
        <p className="text-[#3C281E] font-sans text-sm md:text-base leading-relaxed max-w-md mb-8 md:mb-10">
          {description}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <Link
          to={ctaHref}
          className="inline-flex items-center gap-3 text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-[#3C281E] underline underline-offset-4 decoration-1 hover:no-underline transition-all duration-300 w-fit"
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );

  const imageContent = (
    <div className="h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="h-full w-full object-cover"
      />
    </div>
  );

  return (
    <section className="w-full bg-[#C4A882]">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {imageOnRight ? (
          <>
            <div className="bg-[#C4A882]">{textContent}</div>
            <div className="relative">{imageContent}</div>
          </>
        ) : (
          <>
            <div className="relative order-2 md:order-1">{imageContent}</div>
            <div className="bg-[#C4A882] order-1 md:order-2">{textContent}</div>
          </>
        )}
      </div>
    </section>
  );
}

function InfoColumnsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Do you need some help? */}
          <div className="space-y-4">
            <h3 className="text-lg md:text-2xl font-serif font-normal text-[#3C281E]">
              Do you need some help?
            </h3>
            <div className="flex items-start gap-4">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 mt-1 text-[#3C281E] flex-shrink-0" strokeWidth={1.5} />
              <p className="text-sm md:text-base text-[#3C281E] leading-relaxed">
                Our customer service team will be happy to assist you, please click{' '}
                <Link to="/pages/contact" className="underline underline-offset-2 hover:no-underline font-medium">
                  here
                </Link>{' '}
                to get in touch with us.
              </p>
            </div>
          </div>

          {/* Arrange it yourself */}
          <div className="space-y-4">
            <h3 className="text-lg md:text-2xl font-serif font-normal text-[#3C281E]">
              Arrange it yourself
            </h3>
            <div className="space-y-4">
              <Link to="/pages/pressroom" className="flex items-center gap-4 text-sm md:text-base text-[#3C281E] hover:underline group">
                <Download className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform group-hover:translate-y-1" strokeWidth={1.5} />
                Download pressroom packages
              </Link>
              <Link to="/pages/become-a-dealer" className="flex items-center gap-4 text-sm md:text-base text-[#3C281E] hover:underline group">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform group-hover:scale-105" strokeWidth={1.5} />
                Become a dealer
              </Link>
            </div>
          </div>

          {/* Got some questions? */}
          <div className="space-y-4">
            <h3 className="text-lg md:text-2xl font-serif font-normal text-[#3C281E]">
              Got some questions?
            </h3>
            <Link to="/pages/stores" className="flex items-center gap-4 text-sm md:text-base text-[#3C281E] hover:underline group">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform group-hover:scale-105" strokeWidth={1.5} />
              Where can I buy HKLIVING?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
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
` as const;