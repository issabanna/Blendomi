# Mohannad Wholesale

Arabic-first wholesale ordering prototype for shops in Jordan. React + Vite, deployable as a static website on Vercel. English and left-to-right layouts are available from the header.

## Run

Requires Node.js 22.12+ (tested with Node 24).

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
npm run build
```

Vercel: Vite preset, `npm run build`, output directory `dist`, repository root as the root directory. No environment variables are required for this prototype.

## First-version workflows

- Discover four illustrative Jordanian suppliers; search and filter supplier catalogs by category.
- View wholesale JOD prices immediately without shop approval.
- Build a single-supplier basket with minimum pack quantities, supplier minimum order values, stock limits, delivery coverage, delivery fees, and free-delivery thresholds.
- Save shop delivery details, validate Jordanian mobile numbers, and place local demo orders.
- Track submitted → confirmed → preparing → out for delivery → delivered orders.
- Cancel unconfirmed orders with stock restoration. Reorder using current catalog prices and availability.
- Use the demo supplier workspace to progress orders and edit catalog prices and stock.
- Switch between Arabic/RTL and English/LTR on desktop or mobile.

Local SVG product illustrations require no external image or font service.

## Validation

`npm run build` validates the production bundle. With the dev server running, the browser smoke test is:

```sh
node scripts/smoke.cjs
```

The script requires Playwright and Chromium in the development environment. It uses the managed environment's existing Playwright installation if no local installation exists. `APP_URL` and `CHROMIUM_PATH` can override defaults. It checks order minimums, invalid phone numbers, delivery restrictions, order placement, stock reservation, supplier fulfillment, inventory editing, persistence, current-price reordering, supplier replacement, cancellation/restock, search, and mobile RTL/LTR layouts. Its data exists only in its isolated browser context.

## Demo boundaries

This version does **not** submit orders to real suppliers. Suppliers, products, prices, stock, and delivery terms are illustrative. Orders, shop details, language choice, and baskets are stored only in this browser under `wholesale-v1-*` keys. A browser reset removes them. Different users/devices cannot share orders. Use fictional contact information during testing.

There is no authentication, supplier authorization, merchant onboarding, server/database, payment processing, tax engine, or notification integration. The supplier workspace is explicitly a demo accessible to anyone. Estimated prices include assumed taxes for illustration; real commercial terms must be confirmed before fulfillment. Demo stock is reserved at order submission and returned on cancellation.

The previous community prototype has been replaced. Its old localStorage keys are not read or deleted.

## Next backend phase

Keep the frontend interactions and add a shared API/database with transactional stock reservation, immutable order line snapshots, authenticated shop/supplier/admin roles, and supplier notifications. Approval can be added as a per-supplier policy with shop-supplier relationship records; do not use browser-side flags as an access control. Authentication and server-side authorization are prerequisites before real businesses use supplier management. A later mobile app can share that API.
