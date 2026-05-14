/**
 * Setup script for bank_transfer.proof_object_key order metafield.
 *
 * Run once to register the metafield definition in Shopify Admin.
 * This enables the cart-to-order metafield copy feature.
 *
 * Usage:
 *   node scripts/create-metafield.mjs
 *   # or
 *   bun run scripts/create-metafield.mjs
 *
 * Prerequisites:
 *   - Link to Shopify store: npx shopify hydrogen link
 *   - Pull env vars: npx shopify hydrogen env pull
 *   - Set PRIVATE_ADMIN_API_TOKEN in .env (from Shopify Partners dashboard or store admin)
 */

import 'dotenv/config'

const METAFIELD_DEFINITION = {
  namespace: 'bank_transfer',
  key: 'proof_object_key',
  type: 'single_line_text_field',
  name: 'Bank Transfer Proof Object Key',
  description:
    'R2 object key for bank transfer screenshot. Copied from cart at checkout completion.',
  ownerType: 'ORDER',
}

const queryCheckExisting = `
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
`

const mutationCreate = `
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
`

async function createMetafieldDefinition() {
  const storeDomain = process.env.PUBLIC_STORE_DOMAIN
  const accessToken = process.env.PRIVATE_ADMIN_API_TOKEN

  if (!storeDomain || !accessToken) {
    console.error('Error: PUBLIC_STORE_DOMAIN and PRIVATE_ADMIN_API_TOKEN must be set in .env')
    process.exit(1)
  }

  const endpoint = `https://${storeDomain}/admin/api/2026-01/graphql.json`

  // Check if metafield already exists
  const existingRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: queryCheckExisting,
      variables: {
        namespace: METAFIELD_DEFINITION.namespace,
        key: METAFIELD_DEFINITION.key,
      },
    }),
  })

  if (!existingRes.ok) {
    console.error(`Failed to check existing metafield: ${existingRes.status} ${existingRes.statusText}`)
    process.exit(1)
  }

  const existingData = await existingRes.json()
  const definitions = existingData.data?.metafieldDefinitions?.nodes ?? []

  if (definitions.length > 0) {
    console.log(
      `Metafield definition already exists: ${METAFIELD_DEFINITION.namespace}.${METAFIELD_DEFINITION.key}`
    )
    console.log(`ID: ${definitions[0].id}`)
    console.log('')
    console.log('IMPORTANT: In Shopify Admin, verify "Cart to order copyable" is enabled:')
    console.log('  Settings > Custom data > Orders > Bank Transfer Proof Object Key')
    console.log('  And check "Cart to order copyable" to allow the cart metafield to copy.')
    return
  }

  // Create the metafield definition
  const createRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: mutationCreate,
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
    }),
  })

  if (!createRes.ok) {
    console.error(`Failed to create metafield: ${createRes.status} ${createRes.statusText}`)
    process.exit(1)
  }

  const createData = await createRes.json()
  const { metafieldDefinition, userErrors } = createData.data?.metafieldDefinitionCreate ?? {}

  if (userErrors && userErrors.length > 0) {
    console.error('Failed to create metafield definition:')
    userErrors.forEach((err) => {
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