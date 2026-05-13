/**
 * Setup script for bank_transfer.proof_object_key order metafield.
 *
 * Run once to register the metafield definition in Shopify Admin.
 * This enables the cart-to-order metafield copy feature.
 *
 * Usage:
 *   bun run scripts/create-metafield.ts
 *
 * Prerequisites:
 *   - Link to Shopify store: bunx shopify hydrogen link
 *   - Pull env vars: bunx shopify hydrogen env pull
 */

import { shopify } from '@shopify/hydrogen'
import 'dotenv/config'

const METAFIELD_DEFINITION = {
  namespace: 'bank_transfer',
  key: 'proof_object_key',
  type: 'single_line_text_field',
  name: 'Bank Transfer Proof Object Key',
  description:
    'R2 object key for bank transfer screenshot. Copied from cart at checkout completion.',
  ownerType: 'ORDER',
  // This flag is critical: it enables auto-copy from cart metafield to order metafield
  // at the time checkout completes and an order is created.
  // Note: You must also create the order metafield definition in Shopify Admin
  // with "Cart to order copyable" checked for this to work.
}

async function createMetafieldDefinition() {
  const client = new shopify.api.adminApi.client({
    storeDomain: process.env.PUBLIC_STORE_DOMAIN!,
    apiVersion: '2026-01',
    accessToken: process.env.PRIVATE_ADMIN_API_TOKEN!,
  })

  // Check if metafield already exists
  const existing = await client.query({
    data: `
      query getMetafieldDefinition($namespace: String!, $key: String!) {
        metafieldDefinitions(first: 1, ownerType: ORDER, namespace: $namespace, key: $key) {
          nodes {
            id
            name
            namespace
            key
          }
        }
      }
    `,
    variables: {
      namespace: METAFIELD_DEFINITION.namespace,
      key: METAFIELD_DEFINITION.key,
    },
  })

  const definitions = existing.data?.metafieldDefinitions?.nodes ?? []

  if (definitions.length > 0) {
    console.log(
      `Metafield definition already exists: ${METAFIELD_DEFINITION.namespace}.${METAFIELD_DEFINITION.key}`
    )
    console.log(`ID: ${definitions[0].id}`)
    return
  }

  // Create the metafield definition
  const result = await client.query({
    data: `
      mutation createMetafieldDefinition($input: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $input) {
          metafieldDefinition {
            id
            namespace
            key
            name
            type {
              name
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      input: {
        namespace: METAFIELD_DEFINITION.namespace,
        key: METAFIELD_DEFINITION.key,
        type: {
          name: METAFIELD_DEFINITION.type,
        },
        name: METAFIELD_DEFINITION.name,
        description: METAFIELD_DEFINITION.description,
        ownerType: METAFIELD_DEFINITION.ownerType,
      },
    },
  })

  const { metafieldDefinition, userErrors } = result.data?.metafieldDefinitionCreate ?? {}

  if (userErrors && userErrors.length > 0) {
    console.error('Failed to create metafield definition:')
    userErrors.forEach((err: { field: string[]; message: string }) => {
      console.error(`  - ${err.field.join('.')}: ${err.message}`)
    })
    process.exit(1)
  }

  console.log('Created metafield definition:')
  console.log(`  Namespace: ${metafieldDefinition.namespace}`)
  console.log(`  Key: ${metafieldDefinition.key}`)
  console.log(`  Name: ${metafieldDefinition.name}`)
  console.log(`  Type: ${metafieldDefinition.type.name}`)
  console.log(`  ID: ${metafieldDefinition.id}`)
  console.log('')
  console.log('IMPORTANT: In Shopify Admin, go to:')
  console.log('  Settings > Custom data > Orders > Bank Transfer Proof Object Key')
  console.log('  And enable "Cart to order copyable" to allow the cart metafield to copy.')
}

createMetafieldDefinition().catch((err) => {
  console.error(err)
  process.exit(1)
})