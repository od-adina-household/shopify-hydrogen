import { useRef } from 'react'
import { Link } from 'react-router'
import { gsap, useGSAP } from '~/lib/gsap'
import type { InstagramPost } from '~/types/instagram'

interface InstagramFeedProps {
  posts: InstagramPost[] | null
  isLoading: boolean
  error: Error | null
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function InstagramFeed({ posts, isLoading, error }: InstagramFeedProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ reduceMotion: '(prefers-reduced-motion: reduce)' }, context => {
        const { reduceMotion } = context.conditions!
        if (gridRef.current) {
          gsap.fromTo(
            '.instagram-item',
            { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 },
            {
              opacity: 1,
              y: 0,
              duration: reduceMotion ? 0 : 0.6,
              ease: 'power2.out',
              stagger: reduceMotion ? 0 : 0.08,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top+=80 bottom',
                toggleActions: 'play none none none',
                once: true,
              },
            }
          )
        }
      })
    },
    { scope: sectionRef.current ?? undefined }
  )

  if (isLoading) {
    return (
      <section ref={sectionRef} className="w-full py-20">
        <div
          role="status"
          aria-label="Loading Instagram feed"
          className="flex items-center justify-center h-48"
        >
          <div className="w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
        </div>
      </section>
    )
  }

  if (error || !posts || posts.length === 0) {
    return (
      <section ref={sectionRef} className="w-full py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center space-y-3">
          <div className="flex justify-center text-foreground/40">
            <InstagramIcon size={24} />
          </div>
          <p className="text-foreground/60 font-sans text-sm">Follow us on Instagram</p>
          <Link
            to="https://www.instagram.com/adina.household/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium tracking-wider uppercase text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            <span translate="no">@adina.household</span>
            <span className="sr-only">(opens in new tab)</span>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="w-full py-16 md:py-24 lg:py-28 bg-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-foreground italic leading-tight">
            Follow our journey
          </h2>
          <Link
            to="https://www.instagram.com/adina.household/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-sm text-foreground/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            <InstagramIcon size={13} />
            <span translate="no">@adina.household</span>
            <span className="sr-only">(opens in new tab)</span>
          </Link>
        </div>

        {/* Staggered portrait grid — even-indexed cards offset down */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 items-start"
        >
          {posts.slice(0, 8).map((post, index) => {
            const isVideo = post.mediaType === 'VIDEO'
            const imageUrl = post.sizes?.medium?.mediaUrl || post.mediaUrl
            const posterUrl = post.sizes?.medium?.mediaUrl || post.thumbnailUrl || imageUrl
            const imgWidth = post.sizes?.medium?.width || 525
            const imgHeight = post.sizes?.medium?.height || 700
            const isOffset = index % 2 === 1
            const caption = post.prunedCaption?.split('[')[0].trim().slice(0, 80) || 'Instagram post'

            return (
              <Link
                key={post.id}
                to={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className={`instagram-item relative aspect-[3/4] overflow-hidden group block rounded-[24px] md:rounded-[32px] bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2${isOffset ? ' mt-6 md:mt-10' : ''}`}
              >
                {isVideo ? (
                  <video
                    poster={posterUrl}
                    src={post.mediaUrl}
                    muted={true}
                    autoPlay={true}
                    loop={true}
                    playsInline={true}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt={caption}
                    width={imgWidth}
                    height={imgHeight}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                )}

                {/* Caption overlay — slides up from bottom on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pt-10 pb-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-[transform,opacity] duration-300 ease-out rounded-b-[24px] md:rounded-b-[32px]">
                  {caption !== 'Instagram post' && (
                    <p className="text-amber-50 text-sm leading-relaxed line-clamp-3 mb-2">
                      {caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-amber-50/80 text-xs tracking-wide">View post →</span>
                    {isVideo && (
                      <span className="text-amber-50/80 text-xs font-medium tracking-wider uppercase">
                        {post.isReel ? 'Reel' : 'Video'}
                      </span>
                    )}
                  </div>
                </div>

                <span className="sr-only">(opens in new tab)</span>
              </Link>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 md:mt-14 flex justify-center">
          <Link
            to="https://www.instagram.com/adina.household/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase text-foreground border-b border-foreground/30 hover:border-foreground pb-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            <InstagramIcon size={16} />
            Follow us on Instagram
            <span className="sr-only">(opens in new tab)</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default InstagramFeed
