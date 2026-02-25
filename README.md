# FluentAi-frontend

Frontend for the FluentAI Knowledge Sharing Platform, built with React, Vite and a clean modular structure.

## Tech stack

- **React 18** + **Vite** for a fast SPA dev/build setup
- **React Router** for client-side routing and protected routes
- **Axios** for HTTP requests to the Express backend
- **Context API** for authentication state and JWT handling
- **React Quill** rich-text editor for article content

## Getting started

- **Install dependencies**:

```bash
cd FluentAi-frontend
npm install
```

- **Run dev server**:

```bash
npm run dev
```

Set `VITE_API_BASE_URL` in a `.env` file to point to your backend (for example `http://localhost:3000/api`).

## Project structure

- **`src/api`**: Axios base instance and API helpers
- **`src/components`**: Reusable UI components (e.g. `Navbar`)
- **`src/context`**: React Context providers (Auth context)
- **`src/layouts`**: Layout wrappers (main layout with navbar)
- **`src/pages`**: Route-level pages (auth, articles, dashboard)
- **`src/utils`**: Small utilities and helpers
- **`src/hooks`**: Custom React hooks
- **`App.jsx`**: App routes and protected route wiring

## Pages & flows

- **Auth**
  - `/login` – login with email + password, stores `{ user, token }` from backend.
  - `/signup` – registration form, calls backend register endpoint, then logs user in.
- **Articles**
  - `/` – home, lists and searches articles from `/api/articles`.
  - `/articles/:id` – article detail, renders HTML from `content` and shows `summary` when present.
  - `/articles/new` – create article (protected), uses React Quill for rich content, POSTs to `/api/articles`.
  - `/articles/:id/edit` – edit article (protected), PUTs to `/api/articles/:id`.
  - `/dashboard` – “My articles” view (protected), powered by the same articles API.

Authentication is required for create/edit/dashboard routes; the JWT is sent via `Authorization: Bearer <token>` header.

## Auth & routing

- **Auth context**: `AuthContext` stores the current user and JWT token (from backend), exposes `login`, `signup`, and `logout`.
- **Axios**: `apiClient` sets a base URL and attaches `Authorization` header on login/signup, with a 401 interceptor to clear local storage.
- **Routing**: `react-router-dom` provides public routes (`/`, `/login`, `/signup`, `/articles/:id`) and protected routes (`/articles/new`, `/articles/:id/edit`, `/dashboard`) via a small `ProtectedRoute` wrapper in `App.jsx`.
- **Layout**: `MainLayout` wraps all pages with a `Navbar` and a centered main content area.

## Backend integration & AI endpoints

The frontend is designed to work with the FluentAi Express backend:

- **Auth API**
  - `POST /api/auth/register` – user signup, returns `{ user, token }`
  - `POST /api/auth/login` – user login, returns `{ user, token }`
- **Articles API**
  - `GET /api/articles` – list articles (supports search and filters)
  - `GET /api/articles/:id` – fetch single article
  - `POST /api/articles` – create article (auth required)
  - `PUT /api/articles/:id` – update article (author only, auth required)
  - `DELETE /api/articles/:id` – delete article (author only, auth required)
- **AI API (used by editor features)**
  - `POST /api/ai/improve` – takes raw article content and returns `{ improved }`
  - `POST /api/ai/summary` – takes article content and returns `{ summary }`
  - `POST /api/ai/tags` – optional, suggests tags via `{ tags }`

The article editor is wired so it can call these AI endpoints to:

- Improve article content on demand (AI “Improve” button).
- Auto-generate a summary when an article is created or updated, then store it alongside the article.

## 🧠 AI Usage

**AI tools used**

- Cursor AI for scaffolding the React structure, routing, and initial components.
- ChatGPT for API prompt engineering and frontend-backend contract shaping.

**Where AI helped**

- Initial Vite + React boilerplate and folder structure.
- Designing the auth context and Axios integration patterns.
- Sketching article editor flows with React Quill.
- Identifying edge cases around unauthorized access and missing data.

**Manual improvements**

- Refined auth state handling and logout behavior.
- Adjusted routing and protected route composition to match backend capabilities.
- Tuned layout, spacing, and theming for a cleaner UI.
- Aligned API calls and shapes with the actual backend routes and models.

