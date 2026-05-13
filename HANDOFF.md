# Handoff Document

## Goal

Replace Shopify's hosted checkout with a custom Hydrogen checkout page that retains the bank transfer proof upload step natively. The bank transfer proof upload was previously implemented as a Shopify Checkout UI Extension that blocked checkout until proof was uploaded.

## Current Progress

### Custom Hydrogen Checkout — Live

**Route:** `app/routes/($locale).checkout.tsx` — single all-in-one route, no extra components

**2-step frictionless flow:**
1. **Information** — Contact (email + phone) + Shipping Address + Shipping Method all in one form. Submit fires three mutations in sequence: `updateBuyerIdentity` → `updateDeliveryAddresses` → `updateSelectedDeliveryOption`. Blocks forward navigation until submitted.
2. **Review & Pay** — Order summary sidebar + inline bank transfer proof upload + Place Order button (redirects to Shopify `checkoutUrl`)

**Checkout entry points all routed to `/checkout`:**
- `cart.$lines.tsx` loader → redirects to `/checkout`
- `CartSummary.tsx` → `<Link to="/checkout">`
- `BuyNowButton.tsx` → redirects to `/checkout`

**Order summary:** Shown on both steps. On mobile: stacked on top. On desktop: right column, sticky (`lg:sticky lg:top-4`).

**Layout:** `max-w-7xl` container, `lg:grid-cols-4` (3/4 form, 1/4 summary). Mobile: single column stacked.

### R2 Presigned URL Upload — Complete (unchanged)
- `app/routes/($locale).api.r2.upload-url.tsx` — returns `{uploadUrl, objectKey}` from Workers `createPresignedUploadUrl`
- Client PUTs directly to R2 using the presigned URL
- `app/routes/($locale).api.r2.view-url.tsx` — presigned GET URL for admin viewing

### Cart → Order Metafield Flow — Complete (unchanged)
- Cart fragment queries `bankTransferProof: metafield(namespace: "custom", key: "bank_transfer_proof_object_key")`
- At final step: `cart.setMetafields([{key: 'bank_transfer_proof_object_key', value: objectKey, type: 'single_line_text_field'}])`
- Shopify auto-copies to order via `cartToOrderCopyable` on the `custom.bank_transfer_proof_object_key` metafield definition

### Shipping Options — Fixed This Session

**Problem:** "No shipping options available yet" appeared even after filling address.

**Root cause:** `InformationStep` called `onComplete()` immediately from fetcher data, navigating to Review tab before Shopify had computed the new `deliveryOptions` from the address mutation.

**Fix:**
- Action returns `{ ok: true, intent: 'information' }` with `Cache-Control: no-store` headers
- `Checkout` component uses `fetcher.load(window.location.href)` to re-fetch the loader after action completes, getting the cart **after** Shopify computes shipping options
- Uses `fetcher.data?.cart || cartData` pattern — falls back to loader data until re-fetch completes
- `intent` field on action response prevents wrong triggering for `bankTransferProof` intent

## What Worked

- **Single action for all 3 mutations** (buyer identity + address + shipping) — avoids race conditions of separate fetchers
- `completedInfo` state to lock forward navigation — users cannot skip the Information step
- **`lg:sticky lg:top-4`** — sticky only on desktop, mobile flows naturally
- **`order-2 lg:order-1`** — form second on mobile (summary visible first), form first on desktop (natural reading order)
- `MetafieldWithoutOwnerId = Omit<CartMetafieldsSetInput, 'ownerId'>` — `setMetafields` takes `{key, value, type}` without namespace
- `updateDeliveryAddresses` input shape: `{id, address: {deliveryAddress: {...}}}`
- `updateSelectedDeliveryOption` takes `CartSelectedDeliveryOptionInput[]` — array of `{deliveryGroupId, deliveryOptionHandle}`
- `CartDeliveryOption` has `estimatedCost` (not `price`) and no `carrier`/`estimatedDeliveryDate`
- **`fetcher.load()` re-fetch pattern** — force-refresh cart after mutations to get computed shipping options from Shopify

## What Didn't Work

- **Shopify Checkout UI Extension** (`bank-transfer-checkout`) — superseded by custom checkout; still deployed in Shopify Partners dashboard. Uninstall after custom checkout is live.
- **`customer-account.order-status.block.render`** target was wrong — correct target is `purchase.checkout.block.render`
- **PRIVATE_ADMIN_API_TOKEN** lacked Admin API access — created metafield manually via Shopify Admin UI
- **`--allow-mutations` flag** doesn't exist in CLI v3.94.3
- **`shopify app init --template checkout-ui`** template flag not supported
- **Immediate `onComplete()` in InformationStep useEffect** — triggered navigation before Shopify computed new shipping options. Fixed by deferring to `fetcher.load()` re-fetch in parent component.

## Next Steps

### P0 — Shipping Options Verification
1. Run `bun run dev` → add item to cart → navigate to `/checkout` → fill address → submit → **verify shipping options appear** on Review step before testing other flows

### P1 — Test the Full Flow
2. Fill Information step → submit → verify Review step unlocks with shipping options visible
3. Upload bank transfer proof → Place Order → verify redirects to Shopify checkout
4. In Shopify Admin > Orders > metafield → verify `bank_transfer_proof_object_key` is populated

### P2 — Commit Pending Changes
5. Run `bun run typecheck` and `bun run build` to confirm shipping options fix compiles
6. Commit shipping options fix

### P3 — Cleanup
7. **Uninstall `bank-transfer-checkout` extension** from Shopify Partners dashboard — no longer needed

## Key Files

```
app/
├── routes/($locale).checkout.tsx      # Custom checkout (2-step), shipping options fix
├── routes/($locale).api.r2.upload-url.tsx  # R2 presigned PUT URL
├── routes/($locale).api.r2.view-url.tsx    # R2 presigned GET URL
├── routes/($locale).cart.$lines.tsx   # Redirect → /checkout
├── lib/fragments.ts                    # deliveryGroups + bankTransferProof in cart
└── components/
    ├── BuyNowButton.tsx               # Redirects to /checkout
    └── CartSummary.tsx                # Checkout button → /checkout
shopify-extensions/bank-transfer-extension/  # TO BE UNINSTALLED
shopify.app.toml                       # App config
wrangler.toml                         # R2 binding ASSETS_BUCKET
```