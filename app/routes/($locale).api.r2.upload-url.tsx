import type { Route } from './+types/($locale).api.r2.upload-url'
import { data } from 'react-router'

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url)

  const filename = url.searchParams.get('filename')
  if (!filename) {
    throw new Response('filename is required', { status: 400 })
  }

  const contentType = url.searchParams.get('contentType') || 'image/jpeg'

  // Generate a unique object key for this upload
  const uuid = crypto.randomUUID()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const objectKey = `orders/${uuid}/${sanitizedFilename}`

  const ASSETS_BUCKET = context.env.ASSETS_BUCKET
  if (!ASSETS_BUCKET) {
    throw new Response('R2 bucket not configured', { status: 500 })
  }

  // Generate a presigned PUT URL with 15-minute expiry
  const uploadUrl = await ASSETS_BUCKET.createPresignedUploadUrl(objectKey, {
    contentType,
    expiresIn: 900, // 15 minutes
  })

  return data({ uploadUrl, objectKey })
}