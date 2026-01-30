import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
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
      />
      <IntroSection
        text="Our most expressive collection — for everyone who dares to live with imagination."
        buttonLabel="COOL IN CHROME"
        buttonHref="/collections/chrome"
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
    <section className="w-full px-1 sm:px-2 lg:px-4">
      <div className="max-w-7xl">
        <h2 className="text-lg md:text-3xl lg:text-4xl leading-relaxed font-serif font-normal text-[#3C281E] text-left max-w-5xl pt-12 md:pt-16 pb-6 md:pb-8 pl-0">
          {text}
        </h2>
        <Link
          to={buttonHref}
          className="inline-flex items-center gap-3 text-base md:text-lg lg:text-xl font-medium tracking-wider text-foreground underline underline-offset-4 hover:no-underline transition-all duration-300 mb-4 md:mb-6"
        >
          {buttonLabel}
          <ArrowRight className="h-4 w-4" />
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
    <section className="w-full px-1 sm:px-2 lg:px-4 pt-2 pb-4 md:pb-6 lg:pb-8">
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
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8">
              <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:bg-white">
                <span className="text-sm font-medium tracking-wider text-foreground">
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
          <div className="max-w-7xl mx-auto px-8 space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-white max-w-md">
              A collection that feels both curated and created — where every object carries intention.
            </h1>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/90 hover:bg-white text-foreground border-white"
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
}

function SplitSection({ title, imageSrc, imageAlt, imageOnRight }: SplitSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-[#E8DDD0]">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${imageOnRight ? '' : 'md:grid-flow-dense'}`}>
          <div className={imageOnRight ? 'md:order-1' : 'md:order-2'}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white">
              {title}
            </h2>
          </div>
          <div className={imageOnRight ? 'md:order-2' : 'md:order-1'}>
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoColumnsSection() {
  const infoItems = [
    {
      title: 'Arrival time may vary',
      description: 'Please see our delivery page for up to date information.',
    },
    {
      title: 'Returns if unused',
      description: 'Most items are eligible for return within 30 days of delivery.',
    },
    {
      title: 'Get yours pre-owned',
      description: 'All items can be returned for store credit.',
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {infoItems.map((item, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wide">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
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
