# Technical Notes

## 1. Important Architectural Choices

**Separation of concerns:** API logic lives in `lib/api/` with a shared Axios instance. UI components consume API functions and never call Axios directly. This makes the API layer swappable and testable.

**Context-based state management:** Two React Contexts — `AuthContext` for authentication state and `ProductContext` for local CRUD mutations. No Redux; the state shape is simple enough that Context + hooks suffice.

**URL as source of truth:** All list state (page, pageSize, search, category, sort) lives in URL search params. Components read from the URL and update it via `router.replace()`. This makes the state refresh-safe, shareable, and back/forward navigable.

**Client-side mutation layer:** Since DummyJSON doesn't persist mutations, a localStorage-backed store tracks added, updated, and deleted products. Server data is combined with local overrides at fetch time.

## 2. One Difficult Problem Encountered

**Search race conditions with client-side filtering.** When the user types quickly, multiple search requests fire in succession. An older response arriving after a newer one would overwrite correct results with stale data. Additionally, when combining search with client-side category filtering, the pagination math must reflect the *filtered* result set, not the raw search total.

## 3. How It Was Solved

**Race condition:** Two mechanisms work together:
- A `requestIdRef` counter — each fetch increments it, and only the response matching the current ID updates state.
- An `AbortController` — each new fetch aborts the previous in-flight request via `controller.abort()`, cancelling it at the network level.

**Pagination with client-side filtering:** When search is active, the app fetches all matching results (limit=1000), applies category filtering and sorting client-side, then slices the result for the current page. The `total` reflects the filtered count, so "Showing X–Y of Z" is always accurate.

## 4. Search Race-Condition Solution

```
User types "phone" → requestId=1, fetch starts
User types "iphone" → requestId=2, fetch 1 aborted, fetch 2 starts
Fetch 1 would arrive → requestId mismatch → discarded
Fetch 2 arrives → requestId match → state updated
```

The `AbortController` ensures the cancelled request's promise rejects with a `CanceledError`, which is caught and ignored. The `requestIdRef` check is a second safety net for any edge cases where abort doesn't immediately reject.

## 5. DummyJSON CRUD Limitation

DummyJSON's POST/PUT/DELETE endpoints return a success response with the mutated object but do not persist changes. A subsequent GET returns the original data.

**Solution:** `ProductContext` maintains three pieces of state backed by localStorage:
- `addedProducts[]` — full Product objects with negative IDs
- `updatedProducts{}` — partial overrides keyed by product ID
- `deletedProductIds[]` — IDs to exclude

At fetch time: server products are filtered (remove deleted), merged with updates, and prepended with added products. This derivation happens in the products page's fetch effect.

## 6. URL State Implementation

URL parsing: `parseProductListUrlParams()` reads `URLSearchParams` and normalizes all values to safe defaults — non-numeric pages become 1, invalid page sizes fall back to 20, unknown sort values are cleared.

URL building: `buildProductListUrl()` constructs the query string, only including non-default values (e.g., page=1 and pageSize=20 are omitted for clean URLs).

Updates: Filter/sort changes call `router.replace()` with the new URL, which triggers a re-render and re-fetch via the `useEffect` dependency on parsed URL state.

## 7. Where AI Assistance Was Used

- Initial project scaffolding and component structure
- Boilerplate for form validation and URL state utilities
- Drafting of README and documentation
- Code review suggestions for TypeScript strictness

All AI-generated code was reviewed, understood, and modified as needed.

## 8. What Was Manually Reviewed/Tested

- Login flow with correct and incorrect credentials
- Protected route redirect behavior
- Product list rendering (table on desktop, cards on mobile)
- Pagination: first/last page, page size change, invalid page values
- Search: debounce timing, rapid typing (race condition), clearing search
- Category filter: with and without active search
- Sort: all six sort options, URL persistence
- Product details: gallery navigation, reviews display, invalid ID handling
- Add product: validation errors, successful creation, appearance in list
- Edit product: pre-filled form, update persistence, redirect after save
- Delete product: confirmation modal, successful deletion, empty page handling
- Local persistence: refresh after add/edit/delete
- Error states: API failure, retry button
- Responsive layout: sidebar collapse, mobile nav, filter stacking
