# Handoff Document

## Goal

Replace Shopify's hosted checkout with a custom Hydrogen checkout page that retains the bank transfer proof upload step natively. The bank transfer proof upload was previously implemented as a Shopify Checkout UI Extension that blocked checkout until proof was uploaded.

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
- **`disabled={isSubmitting}` only** — avoids `selectedShipping` state desync blocking button
- **Parent-level fetcher + `useEffect` on `fetcher.data`** — proper React Router pattern for child-to-parent completion signaling (canonical pattern from `CartSummary.tsx`)
- **`setMetafields`** for storing R2 object key — correct approach per Shopify best practices

## What Didn't Work

- **`setInterval` polling on `fetcher.data`** — fragile workaround for child fetcher detection; deleted in fix
- **Button `disabled={isSubmitting || !selectedShipping}`** — `selectedShipping` React state desyncs from DOM after HMR hydration mismatch → button permanently disabled
- **`window.location.href` in dev** — HMR mangles the URL causing 404 loops

## Next Steps

### P0 — Verify full checkout flow in browser
1. Run `bun run dev` and navigate to `/checkout`
2. Fill Information form → click "Continue to Review" → Review tab should appear (no polling needed)
3. Verify empty submission shows red error box with validation messages
4. Complete Review step → Place Order → verify Shopify redirect

### P1 — Uninstall bank-transfer-checkout Shopify extension
- Extension is at `shopify-extensions/bank-transfer-extension/extensions/bank-transfer-checkout`
- After verifying custom checkout works, uninstall the Shopify extension

### P1 — Final verification
1. Run `bun run typecheck && bun run build` — must pass clean
2. Commit all changes

## Key Files

```
app/
├── routes/($locale).checkout.tsx      # Custom checkout — all fixes applied here
├── routes/($locale).api.r2.upload-url.tsx
├── routes/($locale).api.r2.view-url.tsx
├── routes/($locale).cart.$lines.tsx
└── lib/fragments.ts
```

## Critical Code — Fixed State

### Parent fetcher + useEffect (correct — no more setInterval)
```tsx
// Checkout component
const fetcher = useFetcher<ActionResponse>()

useEffect(() => {
  if (fetcher.data?.ok && fetcher.data.intent === 'information') {
    setCompletedInfo(true)
    setActiveStep('review')
    const checkoutPath = import.meta.env.DEV ? '/checkout' : window.location.href
    fetcher.load(checkoutPath)
  } else if (fetcher.data?.ok === false && fetcher.data.intent === 'information') {
    setFormErrors((fetcher.data as any).errors || [])
  }
}, [fetcher.data])
```

### InformationStep receives fetcher as prop
```tsx
function InformationStep({
  fetcher,  // passed from parent, not created internally
  ...
}) {
  return (
    <fetcher.Form method="post" className="space-y-6">
      ...
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Continue to Review'}
      </Button>
    </fetcher.Form>
  )
}
```

### Action response shape (with userErrors)
```typescript
// Success
{ ok: true, intent: 'information' | 'bankTransferProof', checkoutUrl?: string }

// Validation / userError failure
{ ok: false, intent: 'information' | 'bankTransferProof', errors: string[] }
```