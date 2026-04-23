import { useRef } from 'react'
import { Link } from 'react-router'
import { gsap, useGSAP } from '~/lib/gsap'
import type { InstagramPost } from '~/types/instagram'

interface InstagramFeedProps {
  posts: InstagramPost[] | null
  isLoading: boolean
  error: Error | null
}

function InstagramFeed({ posts, isLoading, error }: InstagramFeedProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        context => {
          const { reduceMotion } = context.conditions!

          if (gridRef.current) {
            gsap.fromTo(
              '.instagram-item',
              {
                opacity: reduceMotion ? 1 : 0,
                y: reduceMotion ? 0 : 30,
              },
              {
                opacity: 1,
                y: 0,
                duration: reduceMotion ? 0 : 0.6,
                ease: 'power2.out',
                stagger: reduceMotion ? 0 : 0.1,
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

  if (isLoading) {
    return (
      <section ref={sectionRef} className="w-full px-6 md:px-8 lg:px-12 py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  if (error || !posts || posts.length === 0) {
    return (
      <section ref={sectionRef} className="w-full px-6 md:px-8 lg:px-12 py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-foreground font-sans text-sm md:text-base">
            Follow us on Instagram for updates
          </p>
          <Link
            to="https://www.instagram.com/adina.household/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium tracking-wider uppercase text-primary hover:underline"
          >
            @adina.household
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="w-full px-6 md:px-8 lg:px-12 py-16 md:py-24 lg:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-serif font-normal text-foreground italic">
            Follow our journey
          </h2>
          <Link
            to="https://www.instagram.com/adina.household/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-medium tracking-widest uppercase text-foreground hover:text-primary transition-colors"
          >
            @adina.household
          </Link>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5"
        >
          {posts.slice(0, 8).map(post => {
            const isVideo = post.mediaType === 'VIDEO'
            const imageUrl = post.sizes?.medium?.mediaUrl || post.mediaUrl
            const posterUrl = post.sizes?.medium?.mediaUrl || post.thumbnailUrl || imageUrl

            return (
              <Link
                key={post.id}
                to={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-item relative aspect-square overflow-hidden group bg-background"
              >
                {isVideo ? (
                  <video
                    poster={posterUrl}
                    src={post.mediaUrl}
                    muted={true}
                    autoPlay={true}
                    loop={true}
                    playsInline={true}
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt={post.prunedCaption ? post.prunedCaption.slice(0, 100) : 'Instagram post'}
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                {isVideo && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {post.isReel ? (
                      <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">Reel</span>
                    ) : (
                      <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">Video</span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default InstagramFeed
