# Shopify Hydrogen Storefront — Od Adina Household

A headless Shopify storefront built with Hydrogen, React Router 7, shadcn/ui, and TypeScript. Deploys exclusively to Shopify Oxygen (Cloudflare Workers runtime). Uses Bun as the package manager.

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Shopify Hydrogen | 2026.1.3 |
| Runtime | Cloudflare Workers (Oxygen) | — |
| Routing | React Router | 7.9.2 |
| UI Library | React | 18.3.1 |
| Styling | Tailwind CSS | 4.1.6 |
| Components | shadcn/ui + Radix UI | 30+ components |
| Animation | GSAP | 3.14.2 |
| Forms | react-hook-form + Zod | 7.71.1 / 4.3.6 |
| Charts | Recharts | 2.15.4 |
| Language | TypeScript | 5.9.2 |
| Package Manager | Bun | — |

> **React 19 blocked.** React 18.3.1 and Vite 6.2.4 are required due to Vite 7 SSR conflicts with Hydrogen's mini-oxygen dev server. [Tracking issue #3263](https://github.com/Shopify/hydrogen/issues/3263).

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- A Shopify store with Hydrogen sales channel installed
- Shopify CLI: `bun add -g @shopify/cli`

### 1. Link to Shopify Store

```bash
bunx shopify hydrogen link
```

### 2. Pull Environment Variables

```bash
bunx shopify hydrogen env pull
```

This creates your `.env` file with Shopify credentials including `SESSION_SECRET`, Storefront API tokens, and Customer Account API credentials.

### 3. Generate TypeScript Types

```bash
bun run codegen
```

This runs both `shopify hydrogen codegen` (GraphQL types from your Shopify schema) and `react-router typegen` (route types). Run this whenever your Shopify schema changes.

### 4. Start Development

```bash
bun run dev
```

Opens at `http://localhost:3000`. The dev server includes auto-codegen on file changes.

> If codegen times out, run separately:
> ```bash
> bunx shopify hydrogen codegen    # GraphQL types only
> bunx react-router typegen        # React Router types only
> ```

### 5. Deploy to Production

```bash
bunx shopify hydrogen deploy
```

---

## Development Commands

```bash
bun run dev        # Start dev server with codegen
bun run build      # Production build with codegen
bun run preview    # Preview production build locally
bun run lint       # Run Biome linter
bun run lint:fix   # Auto-fix lint issues
bun run format     # Format code with Biome
bun run typecheck  # Type check with React Router typegen
bun run codegen    # Generate GraphQL + React Router types
```

---

## Project Structure

```
od-adina-household/
├── app/
│   ├── components/
│   │   ├── ui/                     # 30+ shadcn/ui components (Radix-based)
│   │   │   ├── button.tsx, input.tsx, card.tsx, accordion.tsx
│   │   │   ├── carousel.tsx, badge.tsx, dialog.tsx, drawer.tsx
│   │   │   ├── skeleton.tsx, spinner.tsx, tabs.tsx, toggle.tsx
│   │   │   └── ... (30+ total)
│   │   ├── AddToCartButton.tsx    # Add to cart with optimistic UI
│   │   ├── BuyNowButton.tsx        # Quick buy functionality
│   │   ├── CartLineItem.tsx         # Cart line with quantity controls
│   │   ├── CartMain.tsx            # Cart contents display
│   │   ├── CartSummary.tsx         # Cart totals + checkout
│   │   ├── Footer.tsx               # Multi-column footer with social links
│   │   ├── Header.tsx              # Fixed header with nav, search, cart badge
│   │   ├── InstagramFeed.tsx       # Behold.so Instagram integration
│   │   ├── MobileMenu.tsx          # Mobile navigation overlay
│   │   ├── PageLayout.tsx          # Root layout (Aside panels, Header, Footer)
│   │   ├── ProductForm.tsx         # Variant selection + add-to-cart
│   │   ├── ProductItem.tsx         # Product card for grid displays
│   │   ├── ProductImage.tsx        # Optimized product images
│   │   ├── ProductPrice.tsx        # Price + compare-at pricing
│   │   ├── SearchForm.tsx          # Regular search
│   │   ├── SearchFormPredictive.tsx # Predictive search
│   │   ├── WhatsAppWidget.tsx      # Contact widget
│   │   ├── mode-toggle.tsx         # Dark/light theme toggle
│   │   └── PaginatedResourceSection.tsx # Pagination wrapper
│   ├── graphql/
│   │   └── customer-account/       # Customer Account API GraphQL
│   │       ├── CustomerAddressMutations.ts
│   │       ├── CustomerDetailsQuery.ts
│   │       ├── CustomerOrderQuery.ts
│   │       ├── CustomerOrdersQuery.ts
│   │       └── CustomerUpdateMutation.ts
│   ├── hooks/
│   │   ├── use-mobile.ts          # Responsive breakpoint detection
│   │   ├── usePageTransition.ts    # Page transition animations
│   │   ├── useScrollReveal.ts      # Scroll-based reveal animations
│   │   └── useStaggerFadeIn.ts     # Staggered fade-in animations
│   ├── lib/
│   │   ├── context.ts             # Hydrogen context (Storefront + Customer API clients)
│   │   ├── fragments.ts            # Shared GraphQL fragments
│   │   │                          #   CART_QUERY_FRAGMENT, MENU_FRAGMENT,
│   │   │                          #   HEADER_QUERY, FOOTER_QUERY
│   │   ├── gsap.ts                # GSAP initialization (SSR-safe)
│   │   ├── i18n.ts                # Locale detection from URL path
│   │   ├── orderFilters.ts        # Order filtering utilities
│   │   ├── redirect.ts             # Handle localization redirects
│   │   ├── search.ts               # Search types and utilities
│   │   ├── seo.ts                 # JSON-LD structured data helpers
│   │   ├── session.ts              # Theme session resolver (remix-themes)
│   │   ├── sessions.server.ts      # AppSession (cookie-based, HydrogenSession impl)
│   │   ├── useWishlist.ts          # localStorage wishlist hook (client-only)
│   │   ├── utils.ts                # cn() utility (clsx + tailwind-merge)
│   │   └── variants.ts             # Variant URL utilities
│   ├── routes/                     # 30+ locale-aware routes
│   │   ├── ($locale).tsx           # Root locale layout (locale validation)
│   │   ├── ($locale)._index.tsx    # Homepage
│   │   ├── ($locale).products.$handle.tsx        # Product detail
│   │   ├── ($locale).collections.$handle.tsx    # Collection
│   │   ├── ($locale).collections._index.tsx     # All collections
│   │   ├── ($locale).collections.all.tsx         # Featured "all products"
│   │   ├── ($locale).cart.tsx                   # Full cart page
│   │   ├── ($locale).cart.$lines.tsx            # Cart with specific lines
│   │   ├── ($locale).account.tsx                 # Account layout + menu
│   │   ├── ($locale).account._index.tsx          # Account dashboard
│   │   ├── ($locale).account.orders._index.tsx  # Order list
│   │   ├── ($locale).account.orders.$id.tsx     # Order detail
│   │   ├── ($locale).account.addresses.tsx       # Manage addresses
│   │   ├── ($locale).account.profile.tsx         # Profile management
│   │   ├── ($locale).account_.login.tsx         # Login (pathless)
│   │   ├── ($locale).account_.logout.tsx         # Logout action
│   │   ├── ($locale).account_.authorize.tsx      # OAuth authorization
│   │   ├── ($locale).account_.wishlist.tsx       # Wishlist
│   │   ├── ($locale).blogs._index.tsx           # Blog listing
│   │   ├── ($locale).blogs.$blogHandle.$articleHandle.tsx  # Article
│   │   ├── ($locale).pages.$handle.tsx          # CMS pages (dynamic)
│   │   ├── ($locale).pages.privacy-policy.tsx   # Privacy policy
│   │   ├── ($locale).pages.refund-policy.tsx    # Refund policy
│   │   ├── ($locale).pages.terms-of-service.tsx # Terms of service
│   │   ├── ($locale).policies._index.tsx        # Policies listing
│   │   ├── ($locale).policies.$handle.tsx      # Policy pages
│   │   ├── ($locale).discount.$code.tsx         # Discount code
│   │   ├── ($locale).search.tsx                 # Search (regular + predictive)
│   │   ├── ($locale).sitemap.$type.$page[.xml].tsx   # Sitemap
│   │   ├── ($locale).[sitemap.xml].tsx          # Sitemap index
│   │   ├── ($locale).api.$version.[graphql.json].tsx  # GraphQL API endpoint
│   │   ├── ($locale).$.tsx             # 404 catch-all
│   │   ├── [robots.txt].tsx           # Robots.txt
│   │   └── action.set-theme.ts         # Theme setting action
│   ├── app.css            # Tailwind 4 + CSS variables (light/dark themes)
│   ├── entry.client.tsx   # Client entry point
│   ├── entry.server.tsx   # Server entry point
│   ├── root.tsx           # React Router root (critical/deferred loading)
│   └── routes.ts          # Route manifest
├── shopify-extensions/    # Shopify extension configs
├── public/
│   ├── fonts/, images/
│   ├── favicon.ico, logo.svg
│   └── whatsapp-svgrepo-com.svg
├── server.ts              # Cloudflare Workers/Oxygen fetch handler
├── vite.config.ts         # Vite + Hydrogen plugin config
├── react-router.config.ts # React Router config
├── tsconfig.json
├── .graphqlrc.ts         # Two GraphQL projects (storefront + customer-account)
├── components.json       # shadcn/ui config
├── biome.json            # Biome linter/formatter config
└── package.json
```

---

## Architecture

### Routing — React Router 7 with i18n

All routes are prefixed with `($locale)` for internationalization (e.g., `/en-US/products`, `/nl-NL/collections`). Locale detection happens in `app/lib/i18n.ts` by parsing the first URL path segment.

**Route conventions (React Router 7 flat routes):**
- `($locale)._index.tsx` — Index route (homepage)
- `($locale).$handle.tsx` — Dynamic segment (product, collection, page)
- `($locale).account_.login.tsx` — Underscore prefix prevents nesting under `account.tsx` layout (pathless route)
- `($locale).[sitemap.xml].tsx` — Optional segments in brackets

**Locale validation:** `($locale).tsx` loader validates the locale and redirects to 404 if invalid.

### Data Loading — Critical / Deferred Pattern

`root.tsx` implements a two-tier data loading strategy:

1. **Critical data** — `await`ed before render, throws on error (header, layout)
2. **Deferred data** — Returned as promises, errors caught gracefully without blocking render (Instagram feed, related products, analytics)

This ensures pages render even when secondary data sources are slow.

### GraphQL — Two Separate API Projects

**`.graphqlrc.ts`** configures two independent GraphQL projects:

| Project | Schema | Documents | Types Generated |
|---|---|---|---|
| `default` (Storefront) | `getSchema('storefront')` | All `.{ts,tsx}` except `app/graphql/**` | `storefrontapi.generated.d.ts` |
| `customer` (Customer Account) | `getSchema('customer-account')` | `app/graphql/customer-account/*` | `customer-accountapi.generated.d.ts` |

The **Storefront API** handles products, collections, cart, search.
The **Customer Account API** handles auth, orders, addresses, profile.

Shared fragments live in `app/lib/fragments.ts`:
- `CART_QUERY_FRAGMENT` — Full cart data with lines, costs, buyer identity
- `MENU_FRAGMENT` — Hierarchical navigation menu
- `HEADER_QUERY` / `FOOTER_QUERY` — Shop and menu data for layout

### Context — Hydrogen Context

`app/lib/context.ts` wraps `createHydrogenContext` from `@shopify/hydrogen`:
- Cloudflare Worker cache (`caches.open('hydrogen')`)
- `AppSession` with cookie-based session storage
- Locale resolved from request URL via `getLocaleFromRequest()`
- `CART_QUERY_FRAGMENT` passed as the cart query fragment
- `additionalContext` object for extending context with CMS clients or 3P SDKs (augmented via TypeScript declaration merging into `HydrogenAdditionalContext`)

### Session Management

Two separate session layers:

1. **`AppSession`** (`app/lib/sessions.server.ts`) — Main session implementing `HydrogenSession`. Cookie-based (`'session'`, httpOnly, sameSite: lax). `isPending` flag triggers cookie commit in `server.ts`.

2. **Theme session** (`app/lib/session.ts`) — `createThemeSessionResolver` from `remix-themes`. Stores light/dark preference in a separate `'theme'` cookie.

### GSAP — SSR-Safe Initialization

`app/lib/gsap.ts` re-exports `gsap` and `useGSAP` with an `initGSAP()` guard. **Important:** does NOT call `gsap.registerPlugin()` at module scope — this avoids Cloudflare Workers global scope restrictions during SSR bundling. Idempotent, called from client-only entry points.

---

## Adding Features

### Add a shadcn/ui Component

```bash
bunx shadcn@latest add [component-name]
# Example: bunx shadcn@latest add dialog checkbox accordion
```

Components go in `app/components/ui/` and are configured in `components.json` with aliases `~/components/ui` and `~/lib/utils`.

### Add a New Route

Create a file in `app/routes/` following React Router 7 conventions:

```
($locale).your-route.tsx           # /en-us/your-route
($locale).your-route.$param.tsx    # /en-us/your-route/:param
($locale).your-route._index.tsx    # Index at /en-us/your-route
```

Use the `($locale)` prefix for internationalized routes.

### Modify Theme Colors

Edit CSS variables in `app/app.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}
```

Dark mode variables are under `.dark { ... }`.

### Extend Hydrogen Context

Add custom properties to the Hydrogen context via `additionalContext` in `app/lib/context.ts`:

```typescript
// app/lib/context.ts
const additionalContext = {
  myCmsClient: new MyCMSClient(env),
  // Add any custom clients or SDKs here
};
```

This auto-augments the `HydrogenAdditionalContext` TypeScript interface via declaration merging.

---

## Deployment

**Exclusively Shopify Oxygen.** The project is configured for Cloudflare Workers runtime via `server.ts`, which exports the Workers format (`export default { fetch }`).

GitHub workflow files for Oxygen deployment (`.github/workflows/oxygen-deployment-*.yml`) are store-specific and gitignored. Ask your team lead for the deployment workflow configuration.

Do NOT attempt to deploy to Vercel, Netlify, or other self-hosted platforms — this project uses Oxygen-only APIs and session patterns that are incompatible with those runtimes.

---

## Environment Variables

Required in `.env` (auto-generated by `shopify hydrogen env pull`):

| Variable | Description |
|---|---|
| `SESSION_SECRET` | Cookie session encryption key |
| `STOREFRONT_API_TOKEN` | Storefront API public token |
| `STORE_DOMAIN` | Your store's `*.myshopify.com` domain |
| `CUSTOMER_ACCOUNT_API_TOKEN` | Customer Account API token |
| `PUBLIC_STORE_DOMAIN` | Public store domain |
| `PUBLIC_STOREFRONT_API_TOKEN` | Public Storefront API token |

---

## Troubleshooting

**Codegen times out:**
```bash
bunx shopify hydrogen codegen     # Run separately first
bunx react-router typegen        # Then route types
```

**Products not showing:**
- Run `shopify hydrogen link` and `shopify hydrogen env pull`
- Verify `.env` exists with all required variables
- Check products are published in Shopify admin

**Type errors after schema changes:**
```bash
bun run codegen
```

**Theme not persisting:**
- Check `SESSION_SECRET` is set in `.env`
- Verify cookie settings in `app/lib/sessions.server.ts`

---

## License

MIT