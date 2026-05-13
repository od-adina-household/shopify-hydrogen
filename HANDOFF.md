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

### Pending Changes (not yet committed/saved)

In-progress edits to `app/routes/($locale).checkout.tsx`:
1. Country dropdown reduced to **Pakistan only** (`PK`) — was multi-country list
2. All address fields except `address2` (apt/suite) and `zip` (postal) had `required` removed — only `zip` and `address2` remain optional
3. Default country changed to `PK` (Pakistan) on the Select component
4. Container changed from `max-w-3xl` → `max-w-7xl`
5. Grid changed from `lg:grid-cols-5` → `lg:grid-cols-4` for wider form cards

These changes were interrupted — typecheck/run was not confirmed. **Run `bun run typecheck` before committing.**

## What Worked

- **Single action for all 3 mutations** (buyer identity + address + shipping) — avoids race conditions of separate fetchers
- `completedInfo` state to lock forward navigation — users cannot skip the Information step
- **`lg:sticky lg:top-4`** — sticky only on desktop, mobile flows naturally
- **`order-2 lg:order-1`** — form second on mobile (summary visible first), form first on desktop (natural reading order)
- `MetafieldWithoutOwnerId = Omit<CartMetafieldsSetInput, 'ownerId'>` — `setMetafields` takes `{key, value, type}` without namespace
- `updateDeliveryAddresses` input shape: `{id, address: {deliveryAddress: {...}}}`
- `updateSelectedDeliveryOption` takes `CartSelectedDeliveryOptionInput[]` — array of `{deliveryGroupId, deliveryOptionHandle}`
- `CartDeliveryOption` has `estimatedCost` (not `price`) and no `carrier`/`estimatedDeliveryDate`

## What Didn't Work

- **Shopify Checkout UI Extension** (`bank-transfer-checkout`) — superseded by custom checkout; still deployed in Shopify Partners dashboard. Uninstall after custom checkout is live.
- **`customer-account.order-status.block.render`** target was wrong — correct target is `purchase.checkout.block.render`
- **PRIVATE_ADMIN_API_TOKEN** lacked Admin API access — created metafield manually via Shopify Admin UI
- **`--allow-mutations` flag** doesn't exist in CLI v3.94.3
- **`shopify app init --template checkout-ui`** template flag not supported

## Next Steps

### P0 — Finish In-Progress Work
1. Run `bun run typecheck` to confirm Pakistan-only country / optional fields edits are valid
2. Run `bun run build` to verify codegen passes
3. Commit the pending changes to `app/routes/($locale).checkout.tsx`

### P1 — Test the Full Flow
4. `bun run dev` → add item to cart → verify redirect to `/checkout` (not Shopify URL)
5. Fill Information step → submit → verify Review step unlocks
6. Upload bank transfer proof → Place Order → verify redirects to Shopify checkout
7. In Shopify Admin > Orders > metafield → verify `bank_transfer_proof_object_key` is populated

### P2 — Cleanup
8. **Uninstall `bank-transfer-checkout` extension** from Shopify Partners dashboard — no longer needed
9. Remove or simplify the Payment step (it's just an interstitial now that all info is collected in step 1)

## Key Files

```
app/
├── routes/($locale).checkout.tsx      # Custom checkout (2-step)
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
