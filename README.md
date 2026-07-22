# Payme

A small static donation website designed for Vercel hosting.

## What is included

- Home page with mock Stripe payment flow powered by Stripe.js Elements
- Expandable payment support pattern for PayPal or additional providers
- Playwright end-to-end tests
- Lighthouse performance verification script
- k6 performance test script

## Setup

Install dependencies and browser support:

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open the site at `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run start
```

Open the app at `http://localhost:4242`.

## Run the production server with Stripe

1. Create a `.env` file with your Stripe secret key:

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

2. Build and start the server:

```bash
npm run serve
```

3. Open `http://localhost:4242`.

> Use Stripe test cards such as `4242 4242 4242 4242` and a future expiry date.

## Run Playwright E2E tests

```bash
npm run test:e2e
```

## Run Lighthouse performance check

```bash
npm run perf:lighthouse
```

LHCI will collect Lighthouse data and write the output to `reports/lhci-collection.json`.

## Run k6 performance test

Make sure `k6` is installed locally or available in CI, then run:

```bash
npm run perf:k6
```

## Deployment

This site is ready to deploy on Vercel as a static app. Use the default build command `npm run build` and publish the `dist` folder.

### Vercel CLI

Deploy using the Vercel CLI. Install globally or use `npx`:

```bash
# login interactively (one-time)
npx vercel login

# deploy (preview)
npx vercel

# deploy production
npx vercel --prod

# or use the included npm script
npm run deploy:vercel
```
