import type { Route } from './+types/($locale).api.r2.view-url'
import { data } from 'react-router'

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url)

  const objectKey = url.searchParams.get('objectKey')
  if (!objectKey) {
    throw new Response('objectKey is required', { status: 400 })
  }

  const ASSETS_BUCKET = context.env.ASSETS_BUCKET
  if (!ASSETS_BUCKET) {
    throw new Response('R2 bucket not configured', { status: 500 })
  }

  // Generate a presigned GET URL with 15-minute expiry for admin viewing
  const viewUrl = await ASSETS_BUCKET.createPresignedGETUrl(objectKey, 900)

  return data({ viewUrl })
}