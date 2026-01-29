import { Link } from 'react-router';
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
      <ImageGridSection
        title="ambiance to your home with objects that inspire"
        images={[
          { src: '/placeholder-shelf.jpg', alt: 'Curated shelf display' },
          { src: '/placeholder-flowers.jpg', alt: 'Fresh flowers in vase' },
          { src: '/placeholder-interior.jpg', alt: 'Modern interior design' },
        ]}
      />
      <SplitSection
        title="Shaped by light"
        imageSrc="/placeholder-lamps.jpg"
        imageAlt="Decorative lamps and objects"
        imageOnRight
      />
      <ImageGridSection
        title="Our most expressive collection — for everyone who dares to live with imagination."
        images={[
          { src: '/placeholder-art.jpg', alt: 'Decorative art piece' },
          { src: '/placeholder-tableware.jpg', alt: 'Artisan tableware' },
          { src: '/placeholder-living.jpg', alt: 'Living room scene' },
        ]}
      />
      <SplitSection
        title="Cool in chrome"
        imageSrc="/placeholder-chrome.jpg"
        imageAlt="Chrome decorative piece"
        imageOnRight={false}
      />
      <InfoColumnsSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/placeholder-hero.jpg"
          alt="Curated home collection"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="max-w-md space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-white">
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

interface ImageGridSectionProps {
  title: string;
  images: Array<{ src: string; alt: string }>;
}

function ImageGridSection({ title, images }: ImageGridSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-8 max-w-7xl">
        <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-2xl">
          {title}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="aspect-[3/4] overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
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
