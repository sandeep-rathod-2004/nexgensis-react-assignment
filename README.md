# Product Admin Dashboard

## Overview

A professional admin dashboard where an authenticated user can log in and manage products using the free [DummyJSON API](https://dummyjson.com). The application features a full product CRUD interface with search, filtering, sorting, pagination, and client-side persistence of mutations.

## Tech Stack

- **Next.js** (App Router) — React framework with file-based routing
- **React** — UI library with hooks
- **TypeScript** — Strict type safety throughout
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client for all API communication
- **DummyJSON API** — Mock REST API for product data and authentication
- **shadcn/ui** components — Radix UI primitives styled with Tailwind
- **lucide-react** — Icon library
- **sonner** — Toast notifications

## Features

- **Authentication** — Login with DummyJSON credentials, token-based session, protected routes
- **Product List** — Desktop table view and mobile card view with proper formatting
- **Search** — Debounced search (400ms) with AbortController-based race condition protection
- **Category Filter** — Dropdown populated from the API, with client-side filtering for search results
- **Sorting** — Sort by price, rating, or title in ascending or descending order
- **Pagination** — Manual pagination with page numbers, prev/next buttons, and page size selector (10/20/50)
- **URL State** — All filter/sort/pagination state lives in the URL; refresh-safe and shareable
- **Product Details** — Image gallery, full product info, customer reviews
- **Add/Edit Product** — Validated forms with inline error messages and loading states
- **Delete Product** — Confirmation modal with loading state
- **Local CRUD Persistence** — Mutations stored in localStorage so changes survive page refresh
- **Loading States** — Skeleton loaders for tables, forms, and detail pages
- **Empty States** — Professional empty state with clear filters and add product actions
- **Error States** — Centralized error normalization with retry buttons
- **Toast Feedback** — Success and error notifications for all key actions
- **Responsive Design** — Sidebar collapses to mobile nav, table switches to cards
- **Accessibility** — Semantic HTML, ARIA labels, keyboard navigation, focus states

## Authentication

The application uses DummyJSON's authentication endpoint (`POST /auth/login`). The provided demo credentials are:

- **Username:** `emilys`
- **Password:** `emilyspass`

These credentials are pre-filled on the login page for convenience. The app authenticates through the API — no tokens are hardcoded. On successful login, the access token and user data are stored in `localStorage` and attached to subsequent requests via an Axios request interceptor. Unauthenticated users are redirected to `/login`. A 401 response from any API call clears the session and redirects to login.

## API

All API communication uses a shared Axios instance (`lib/api/axios.ts`) configured with:

- Base URL: `https://dummyjson.com`
- Request interceptor: attaches the Bearer token from localStorage
- Response interceptor: normalizes errors, handles 401 by clearing session

API functions are organized in:
- `lib/api/auth.ts` — `loginUser()`, `getCurrentUser()`
- `lib/api/products.ts` — `getProducts()`, `searchProducts()`, `getProduct()`, `createProduct()`, `updateProduct()`, `deleteProduct()`
- `lib/api/categories.ts` — `getCategories()`

UI components never call Axios directly — they use the API layer functions.

## Project Structure

```
app/
  layout.tsx              — Root layout with AuthProvider, ProductProvider, Toaster
  page.tsx                — Redirects to /products
  not-found.tsx           — Global 404 page
  login/
    page.tsx              — Suspense wrapper
    LoginPageContent.tsx  — Login form (uses useSearchParams)
  products/
    layout.tsx            — Dashboard layout with ProtectedRoute, Sidebar, MobileNav
    page.tsx              — Product list with filters, table/cards, pagination
    new/
      page.tsx            — Add product form
    [id]/
      page.tsx            — Product details with gallery and reviews
      edit/
        page.tsx          — Edit product form

components/
  layout/
    Sidebar.tsx           — Desktop sidebar navigation
    Header.tsx            — Dashboard header with user dropdown
    MobileNav.tsx         — Mobile slide-out navigation
  auth/
    ProtectedRoute.tsx    — Route guard wrapper
  products/
    ProductTable.tsx      — Desktop table view
    ProductCard.tsx       — Mobile card view
    ProductFilters.tsx    — Search, category, sort, page size toolbar
    ProductPagination.tsx — Manual pagination controls
    ProductForm.tsx       — Shared add/edit form with validation
    ProductGallery.tsx    — Image gallery with thumbnails
    ProductReviews.tsx    — Customer reviews display
    DeleteProductModal.tsx— Delete confirmation dialog
    ProductEmptyState.tsx — Empty state with actions
    ProductSkeleton.tsx   — Skeleton loaders for table and detail
    ProductFormSkeleton.tsx — Skeleton loader for form
    StarRating.tsx        — Visual star rating component
  ui/
    ErrorState.tsx        — Reusable error state with retry
    (other shadcn/ui components)

context/
  AuthContext.tsx         — Authentication state and actions
  ProductContext.tsx      — Local mutation store (add/update/delete)

lib/
  api/
    axios.ts              — Shared Axios instance with interceptors
    auth.ts               — Authentication API functions
    products.ts           — Product API functions
    categories.ts         — Category API functions
  utils/
    pagination.ts         — Pagination calculations and page number generation
    validation.ts         — Form validation and sort option definitions
    formatting.ts         — Price, date, rating, and stock formatting
    url-state.ts          — URL parameter parsing and building
    local-mutations.ts    — localStorage helpers for local CRUD persistence

types/
  auth.ts                 — User, AuthResponse, LoginCredentials types
  product.ts              — Product, Review, Category, form types
  index.ts                — Re-exports
```

## Setup

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

No environment variables are required. The application uses the public DummyJSON API at `https://dummyjson.com` with no API key. All configuration is handled in the shared Axios instance.

## Build

```bash
npm run build
```

This produces a production-optimized build in the `.next` directory.

## Deployment

The project is Vercel-ready:

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Vercel auto-detects Next.js — no additional configuration needed
4. Deploy

No environment variables need to be configured on Vercel.

## URL State

All list state is persisted in the URL query parameters:

- `page` — Current page number
- `pageSize` — Items per page (10, 20, or 50)
- `search` — Search query text
- `category` — Category slug filter
- `sort` — Sort field and direction (e.g., `price-asc`)

Example URL: `/products?page=2&pageSize=20&search=phone&category=smartphones&sort=price-asc`

Refreshing the page preserves the exact state. Sharing the URL reproduces the same view. Invalid values (`?page=abc`, `?pageSize=invalid`, `?sort=random`) are normalized to safe defaults. Pages beyond the total are automatically redirected to the last valid page.

## Search Race Condition

Search uses two layers of protection against stale responses:

1. **Debouncing (400ms)** — The search input updates local state immediately, but the debounced value (which triggers the API call) only updates after the user stops typing for 400ms. This reduces the number of requests.

2. **Request ID tracking + AbortController** — Each fetch operation increments a `requestIdRef` counter. When a response arrives, it only updates state if its request ID matches the current latest ID. Additionally, an `AbortController` aborts any in-flight request before starting a new one, ensuring the network request itself is cancelled.

This means if the user types "phone" then "iphone" quickly, even if the "phone" response arrives after "iphone", it is discarded — only the latest request's results are displayed.

## Search + Category Limitation

DummyJSON does not support combined server-side search and category filtering in a single API call. The `/products/search?q=` endpoint does not accept a category parameter.

**Chosen approach:** When a search query is active, the app fetches all matching results from the search endpoint (with a large limit), then applies category filtering and sorting client-side. Pagination is then computed from the filtered result set, ensuring "Showing X–Y of Z" always reflects the displayed data. When no search is active, the app uses the server-side category endpoint (`/products/category/{slug}`) with proper server-side pagination and sorting.

## CRUD Persistence Limitation

DummyJSON's add, update, and delete endpoints are **simulated** — they return a successful response but do not actually persist changes on the server. A subsequent GET request returns the original unmodified data.

**Solution:** The app maintains a client-side mutation layer in `ProductContext` backed by `localStorage`:

- **Added products** — Stored as full product objects with negative IDs to distinguish from server products
- **Updated products** — Stored as partial overrides keyed by product ID, merged with server data on display
- **Deleted products** — Stored as a set of IDs to exclude from server results

When fetching products, the app combines server data with local mutations: added products are prepended, updated products are merged, deleted products are filtered out. This ensures the user sees their changes immediately and after page refresh, within the same browser session.

## Error Handling

All API errors are normalized through a central `normalizeApiError()` function that extracts human-readable messages from Axios errors and avoids exposing raw technical details. Error states display a clear message with a retry button. 401 errors automatically clear the session and redirect to login. Toast notifications provide feedback for successful and failed operations.

## Accessibility

- Semantic HTML elements (`nav`, `header`, `main`, `table`, `form`)
- ARIA labels on icon-only buttons and interactive controls
- `aria-busy` on loading buttons, `aria-invalid` on form fields with errors
- `aria-live` regions for pagination status
- `role="alert"` on validation error messages
- Keyboard-accessible modal dialogs (Radix UI Dialog handles focus trapping)
- Meaningful alt text on product images
- Color is never the sole indicator — stock status includes text labels alongside colored badges
- Focus-visible styles on all interactive elements

## AI Usage

AI tools were used for assistance during development, including code generation, refactoring suggestions, and documentation. All generated code was reviewed, understood, and adjusted as needed to ensure correctness, maintainability, and alignment with the assignment requirements. The architectural decisions, state management strategy, and race condition solution were designed with full understanding of the underlying concepts.

## Known Limitations

- **DummyJSON mutations are not persisted server-side** — Add/edit/delete changes are only visible in the current browser session via localStorage. Opening the app in a different browser or clearing storage resets to the original server data.
- **Search results fetched in bulk** — To support client-side category filtering on search results, the app fetches up to 1000 search results at once. This is a trade-off for correctness over network efficiency.
- **No real authentication persistence** — DummyJSON tokens have a limited lifetime. The app handles 401s gracefully but does not implement token refresh.
- **No image upload** — New products use placeholder images since DummyJSON does not support file uploads.
