export interface InstagramPostSize {
  mediaUrl: string
  height?: number
  width?: number
}

export interface InstagramPost {
  id: string
  permalink: string
  prunedCaption: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  mediaUrl: string
  isReel?: boolean
  thumbnailUrl?: string
  missingVideoThumbnail?: boolean
  sizes: {
    small: InstagramPostSize
    medium: InstagramPostSize
    large: InstagramPostSize
    full: InstagramPostSize
  }
}

// Augment Cloudflare Workers Env with our custom env vars
declare global {
  interface Env {
    BEHOLD_FEED_ID?: string
  }
}
