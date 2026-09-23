# 🚀 Product Admin Dashboard

<p align="center">
  <strong>A modern, responsive product administration dashboard built with Next.js, React, TypeScript, Tailwind CSS, Axios, and DummyJSON.</strong>
</p>

<p align="center">
  <a href="https://nexgensis-react-assignment-eight.vercel.app/">
    🌐 Live Demo
  </a>
  &nbsp; • &nbsp;
  <a href="https://github.com/sandeep-rathod-2004/nexgensis-react-assignment">
    💻 GitHub Repository
  </a>
</p>

---

## ✨ Overview

A full-featured **Product Admin Dashboard** designed for managing products through a clean and responsive interface.

The application includes authentication, protected routes, product management, search, filtering, sorting, pagination, CRUD operations, local persistence, caching, responsive layouts, and robust error handling.

---

## 🖥️ Live Demo

### 🌐 [Open Product Admin Dashboard](https://nexgensis-react-assignment-eight.vercel.app/)

### 💻 [View Source Code](https://github.com/sandeep-rathod-2004/nexgensis-react-assignment)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| ⚛️ **React** | UI development |
| ▲ **Next.js** | App Router & application framework |
| 🔷 **TypeScript** | Type safety |
| 🎨 **Tailwind CSS** | Styling & responsive design |
| 📡 **Axios** | API communication |
| 🧪 **DummyJSON** | Mock REST API |
| 🧩 **shadcn/ui** | UI components |
| 🎯 **lucide-react** | Icons |
| 🔔 **Sonner** | Toast notifications |

---

# ✨ Features

## 🔐 Authentication

- 🔑 DummyJSON authentication
- 🛡️ Protected product routes
- 🚪 Login / Logout
- 🔄 Automatic redirect for unauthenticated users
- ⚠️ Centralized `401` handling
- 🎫 Bearer token attached through Axios interceptor

### 🔑 Demo Credentials

```text
Username: emilys
Password: emilyspass
📦 Product Management
📋 Desktop product table
📱 Mobile responsive product cards
🖼️ Product images
🏷️ Product title & category
💰 Price
⭐ Rating
📦 Stock
👁️ Product details
💬 Product reviews
➕ Add product
✏️ Edit product
🗑️ Delete product
⚠️ Delete confirmation modal
🔎 Smart Product Search

The dashboard supports fast product searching with both API and local filtering.

Search Features
⚡ 250ms debounce
🔍 DummyJSON /products/search?q= integration
📡 Axios-based requests
🛑 AbortController cancellation
🧠 Request-ID race-condition protection
💾 Cached catalog filtering
➕ Local products included in search
✏️ Updated products included
🗑️ Deleted products excluded
🔍 Search Fields

Search works across:

Title
Description
Brand
Category
Tags

Basic singular/plural matching is also supported:

laptop
laptops
🎛️ Filtering & Sorting
🗂️ Category Filtering

Products can be filtered by category.

↕️ Sorting
Sort Option	Direction
💰 Price	Low → High
💰 Price	High → Low
⭐ Rating	Low → High
⭐ Rating	High → Low
🔤 Title	A → Z
🔤 Title	Z → A

Sorting is applied before pagination.

📄 Pagination

Manual pagination is implemented without a pagination library.

Available Page Sizes
10
20
50
Pagination Controls
◀️ Previous
🔢 Page numbers
▶️ Next
📊 Current page
📈 Total pages
📦 Total matching products

Example:

Showing 21–40 of 194

Pagination is calculated after filtering and sorting.

⚡ Performance & Caching

The product dashboard is optimized to avoid unnecessary repeated API requests.

🚀 Product Catalog Flow
             Products Page
                   │
                   ▼
                Axios
                   │
                   ▼
          DummyJSON Catalog
                   │
                   ▼
            sessionStorage
                   │
                   ▼
        Local Product Catalog
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
    Search      Filter       Sort
       │           │           │
       └───────────┼───────────┘
                   ▼
              Pagination
                   │
                   ▼
              UI Results

After the catalog is loaded, these operations are handled locally:

⚡ Pagination
🗂️ Category filtering
↕️ Sorting
📄 Page-size changes
🔎 Search matching
📊 Total calculation

This significantly reduces unnecessary product-list API requests.

🧠 Search Race-Condition Protection

Search uses three layers of protection.

1️⃣ Debouncing
250ms

Prevents a request from being triggered for every keystroke.

2️⃣ AbortController

When a newer request starts, the previous request can be cancelled.

3️⃣ Request ID

Every request receives a unique ID.

Only the latest request is allowed to update the displayed results.

Example:

User searches:

phone
   ↓
iphone

If the phone response arrives after the iphone response, the stale response cannot overwrite the newer result.

🔗 URL-Based State

The product-list state is stored in URL parameters.

/products?page=2&pageSize=20&search=phone&category=smartphones&sort=price-asc
Stored State
🔎 Search
🗂️ Category
↕️ Sort
📄 Page
📏 Page size
Benefits
🔄 Survives page refresh
🔖 Bookmarkable
🔗 Shareable
↩️ Browser back/forward support
🛡️ Invalid values are safely normalized
🔄 CRUD Operations

The dashboard supports complete product CRUD functionality.

Operation	Support
➕ Create	✅
👁️ Read	✅
✏️ Update	✅
🗑️ Delete	✅
➕ Create

Products can be added through the Add Product page with form validation.

✏️ Update

Existing products can be edited through the Edit Product page.

🗑️ Delete

Products require confirmation before deletion.

Loading and error states are shown during the operation.

💾 Local CRUD Persistence

DummyJSON mutation endpoints are simulated and do not permanently modify the server dataset.

To provide a consistent dashboard experience, local mutations are maintained using ProductContext and localStorage.

➕ Added Products

Stored as complete product objects.

Negative IDs distinguish locally created products from server products.

✏️ Updated Products

Stored as partial overrides keyed by product ID.

🗑️ Deleted Products

Deleted product IDs are stored locally and excluded from displayed results.

Create
  ↓
localStorage
  ↓
Product Context
  ↓
Product Catalog
  ↓
UI
🌐 API Architecture

All API communication goes through a shared Axios instance.

lib/api/
├── axios.ts
├── auth.ts
├── products.ts
└── categories.ts
Axios Responsibilities
🌐 Base URL configuration
🔐 Authentication token attachment
⚠️ Centralized error handling
🚨 401 handling
🧹 Error normalization

UI components do not directly call Axios.

🧩 API Functions
🔐 Authentication
loginUser()
getCurrentUser()
📦 Products
getProducts()
searchProducts()
getProduct()
createProduct()
updateProduct()
deleteProduct()
🗂️ Categories
getCategories()
📁 Project Structure
app/
├── layout.tsx
├── page.tsx
├── not-found.tsx
│
├── login/
│   ├── page.tsx
│   └── LoginPageContent.tsx
│
└── products/
    ├── layout.tsx
    ├── page.tsx
    │
    ├── new/
    │   └── page.tsx
    │
    └── [id]/
        ├── page.tsx
        └── edit/
            └── page.tsx

components/
├── auth/
├── layout/
├── products/
└── ui/

context/
├── AuthContext.tsx
└── ProductContext.tsx

lib/
├── api/
│   ├── axios.ts
│   ├── auth.ts
│   ├── products.ts
│   └── categories.ts
│
└── utils/
    ├── pagination.ts
    ├── validation.ts
    ├── formatting.ts
    ├── url-state.ts
    ├── local-mutations.ts
    └── product-cache.ts

types/
├── auth.ts
├── product.ts
└── index.ts
📱 Responsive Design

The dashboard is optimized for desktop and mobile devices.

🖥️ Desktop

Products are displayed in a structured table.

📱 Mobile

Products automatically switch to responsive cards.

The desktop sidebar also changes to mobile navigation.

♿ Accessibility

Accessibility considerations include:

🏷️ Semantic HTML
🎯 ARIA labels
⌨️ Keyboard-accessible controls
👁️ Focus-visible states
💬 Accessible dialogs
⏳ aria-busy
⚠️ aria-invalid
📢 aria-live
🚨 role="alert"
🖼️ Meaningful image alt text
⚠️ Error Handling

The application provides:

⏳ Loading states
📭 Empty states
❌ Error states
🔄 Retry actions
🔔 Toast notifications
🔐 Automatic 401 handling
🧹 Normalized API errors
🧪 Verification

The project is verified using:

npm run lint
npm run typecheck
npm run build
Tested Functionality
✅ Authentication
✅ Protected routes
✅ Product listing
✅ Search
✅ Search race conditions
✅ Category filtering
✅ Sorting
✅ Pagination
✅ URL state
✅ Add product
✅ Edit product
✅ Delete product
✅ Local persistence
✅ Responsive views
✅ Error handling
✅ Retry handling
✅ Production build
🚀 Getting Started
1️⃣ Clone
git clone https://github.com/sandeep-rathod-2004/nexgensis-react-assignment.git
2️⃣ Enter the project
cd nexgensis-react-assignment
3️⃣ Install dependencies
npm install
4️⃣ Start development server
npm run dev

Open:

http://localhost:3000
📜 Available Scripts
Command	Description
npm run dev	🚀 Development server
npm run build	📦 Production build
npm run start	🌐 Production server
npm run lint	🔍 ESLint
npm run typecheck	🔷 TypeScript validation
🌐 Deployment
🚀 Vercel

Live Application

https://nexgensis-react-assignment-eight.vercel.app/

💻 GitHub

https://github.com/sandeep-rathod-2004/nexgensis-react-assignment

Deployment Flow
GitHub
   ↓
Vercel
   ↓
Next.js Build
   ↓
Production Deployment

No environment variables are required for the current DummyJSON configuration.

⚠️ Known Limitations
DummyJSON Mutations

DummyJSON create/update/delete operations are simulated and are not permanently persisted on the server.

The application therefore maintains local persistence through localStorage.

Session Cache

The product catalog cache uses sessionStorage and is scoped to the current browser session/storage context.

Authentication

DummyJSON authentication tokens have a limited lifetime.

The application handles 401 responses but does not implement token refresh.

Image Upload

Real image uploading is not implemented.

New products use placeholder image data because DummyJSON does not provide persistent image-upload functionality.

🤖 AI Usage

AI tools were used during development for:

💻 Code generation assistance
🐛 Debugging
♻️ Refactoring suggestions
⚡ Performance optimization
📝 Documentation assistance

All AI-assisted code was reviewed, understood, tested, and adjusted as necessary.

The final implementation was manually verified against the assignment requirements.

📋 Assignment Requirements Covered
Requirement	Status
⚛️ Next.js	✅
⚛️ React	✅
🎨 Tailwind CSS	✅
📡 Axios	✅
🌐 DummyJSON API	✅
🔐 Authentication	✅
🛡️ Protected routes	✅
📦 Product management	✅
📱 Responsive design	✅
🔎 Search	✅
⏱️ Debouncing	✅
🛑 Race-condition protection	✅
🗂️ Category filtering	✅
↕️ Sorting	✅
📄 Pagination	✅
🔗 URL state	✅
👁️ Product details	✅
➕ Add/Edit/Delete	✅
🧪 Validation	✅
⏳ Loading states	✅
📭 Empty states	✅
❌ Error states	✅
🔄 Retry handling	✅
💾 Local CRUD persistence	✅
♿ Accessibility	✅
🚀 Production deployment	✅
📝 Documentation	✅
👨‍💻 Developer

Sandeep Rathod

B.Tech — Computer Science & Engineering

🔗 Project Links

🌐 Live:
https://nexgensis-react-assignment-eight.vercel.app/

💻 GitHub:
https://github.com/sandeep-rathod-2004/nexgensis-react-assignment

📄 License

This project was created as a technical assignment and demonstration project.
