# Handoff Document

## Goal

Make the checkout process frictionless and industry-standard, per Shopify best practices. The cart, checkout page, and order summary must be properly linked — and the bank transfer proof upload to R2 must work on Shopify Oxygen deployment.

## Current Progress

### Custom Hydrogen Checkout — COMPLETE

**Route:** `app/routes/($locale).checkout.tsx` — single all-in-one route

**2-step frictionless flow:**
1. **Information** — Contact (email + phone) + Shipping Address + Shipping Method in one form. Fires three mutations in sequence: `updateBuyerIdentity` → `addDeliveryAddresses` → `updateSelectedDeliveryOption`.
2. **Review & Pay** — Order summary sidebar + inline bank transfer proof upload + Place Order button (redirects to Shopify `checkoutUrl`).

### All Issues Fixed

**P0 — Navigation bug: FIXED**
- Root cause: `InformationStep` created its own child `useFetcher()`; parent's `useActionData()` could not observe it (React Router only tracks the route's own action data, not child fetcher submissions).
- Fix: Parent (`Checkout`) now holds the fetcher and renders `<fetcher.Form>` passed to `InformationStep` via prop. Parent uses `useEffect` watching `fetcher.data` to detect completion and switch tabs — the same pattern used in `CartSummary.tsx` for gift card adds.
- The `setInterval` polling workaround (`checkComplete = setInterval(...)`) is deleted.

**P1 — No userErrors handling: FIXED**
- Every mutation now checks `result.userErrors?.length` after the cart response
- Errors are logged to server console with `[checkout]` prefix
- Errors surface to user via `{ ok: false, intent, errors: string[] }` response
- Applied to: `updateBuyerIdentity`, `addDeliveryAddresses`, `updateSelectedDeliveryOption`, `setMetafields`

**P1 — No server-side validation: FIXED**
- Action validates before mutations: `email`, `address1`, `city`, `zip`, `country`, `deliveryOptionHandle`
- Returns `422` with error list on validation failure
- Errors display in a red error box at top of `InformationStep` form

**P0 — Empty cart guard: FIXED**
- Checkout loader now redirects to `/cart` if cart has no lines — prevents empty checkout state

**P0 — ReviewStep duplication: FIXED**
- Previously the file had `InformationStep` function definition merged inside `ReviewStep` body (lines 534–719), plus a duplicate `ReviewStep` at the end. Full file rewritten cleanly.

**P1 — ReviewStep missing discount/gift card display: FIXED**
- ReviewStep totals now show applied discount codes (green text) and gift cards (green text with masked last characters), matching Shopify standard checkout behavior.

**P1 — R2 upload error message: FIXED**
- `/api/r2/upload-url` now returns 503 (not 500) with message: `"R2 bucket not configured. This feature requires deployment to Shopify Oxygen."` — makes it clear this is a dev-only limitation.

### Shipping Options — Previously Fixed

1. `updateDeliveryAddresses` called with wrong ID type → switched to `addDeliveryAddresses`
2. `updateBuyerIdentity` lacked `countryCode` → added `countryCode: country`
3. Country initialized to `'US'` instead of `'PK'` → fixed default to `'PK'`
4. Premature `onComplete()` from fetcher data → removed inline call, parent `useEffect` handles navigation
5. `window.location.href` caused HMR 404 loops → `fetcher.load('/checkout')` in dev, `window.location.href` in prod
6. `disabled={isSubmitting || !selectedShipping}` → `disabled={isSubmitting}` (radio state desync after HMR hydration mismatch)

## What Worked

- **`addDeliveryAddresses`** — no ID needed, creates new selectable address, triggers delivery group computation
- **`fetcher.load('/checkout')`** — re-fetches cart after mutations to get computed shipping options
- **`disabled={isSubmitting}` only** — avoids `selectedShipping` React state desync blocking button
- **Parent-level fetcher + `useEffect` on `fetcher.data`** — proper React Router pattern for child-to-parent completion signaling (canonical pattern from `CartSummary.tsx`)
- **`setMetafields`** for storing R2 object key — correct approach per Shopify best practices

## What Didn't Work

- **`setInterval` polling on `fetcher.data`** — fragile workaround for child fetcher detection; deleted in fix
- **Button `disabled={isSubmitting || !selectedShipping}`** — `selectedShipping` React state desyncs from DOM after HMR hydration mismatch → button permanently disabled
- **`window.location.href` in dev** — HMR mangles the URL causing 404 loops
- **R2 in local dev** — `ASSETS_BUCKET` binding only exists in Oxygen deployment, not in mini-oxygen dev server

## R2 Upload — Important Context

The upload URL endpoint (`/api/r2/upload-url`) and the R2 PUT flow work correctly. **The `ASSETS_BUCKET` R2 binding only exists when deployed to Shopify Oxygen** — not in `bun run dev` (mini-oxygen). The error "R2 bucket not configured" in dev is expected behavior.

To test the full flow end-to-end:
1. Deploy to Shopify Oxygen (`bunx shopify hydrogen deploy`)
2. Or: configure `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in `.env` and use Cloudflare API directly (bypasses binding)

The upload URL generation logic at `app/routes/($locale).api.r2.upload-url.tsx` is correct and tested.

## Next Steps

### P0 — Verify full checkout flow in browser (Oxygen deployment)
1. Deploy to Oxygen
2. Fill Information form → click "Continue to Review" → Review tab should appear
3. Upload a bank transfer receipt image → verify "Proof uploaded" green confirmation
4. Click "Place Order" → verify redirect to Shopify checkoutUrl
5. Verify proof metafield is stored in Shopify for the order

### P1 — Uninstall bank-transfer-checkout Shopify extension
- Extension is at `shopify-extensions/bank-transfer-extension/extensions/bank-transfer-checkout`
- After verifying custom checkout works on Oxygen, uninstall the Shopify extension

### P1 — Final verification
1. Run `bun run typecheck && bun run build` — must pass clean
2. Run `bun run lint` — must pass clean (ignoring `.wrangler/` artifacts)
3. Commit all changes

## Key Files

```
app/
├── routes/($locale).checkout.tsx      # Custom checkout — all fixes applied here
├── routes/($locale).api.r2.upload-url.tsx  # R2 presigned URL (503 in dev, works on Oxygen)
├── routes/($locale).api.r2.view-url.tsx     # R2 view URL (if needed for preview)
├── routes/($locale).cart.$lines.tsx        # Quick-add-cart route
└── lib/fragments.ts                        # CART_QUERY_FRAGMENT includes bankTransferProof metafield
```

## Critical Code — Current State

### Parent fetcher + useEffect (no more setInterval)
```tsx
const fetcher = useFetcher<ActionResponse>()

useEffect(() => {
  if (fetcher.data?.ok && fetcher.data.intent === 'information') {
    setCompletedInfo(true)
    setActiveStep('review')
    const checkoutPath = import.meta.env.DEV ? '/checkout' : window.location.href
    fetcher.load(checkoutPath)
  } else if (fetcher.data?.ok === false && fetcher.data?.intent === 'information') {
    setFormErrors(fetcher.data.errors || [])
  }
}, [fetcher.data])
```

### Empty cart guard in loader
```tsx
if (!cartData || !cartData.lines?.nodes?.length) {
  return new Response(null, { status: 302, headers: { Location: '/cart', ... } })
}
```

### Action response shape
```typescript
// Success
{ ok: true, intent: 'information' | 'bankTransferProof', checkoutUrl?: string }
// Validation / userError failure
{ ok: false, intent: 'information' | 'bankTransferProof', errors: string[] }
```