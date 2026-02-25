# FluentAi-frontend

Frontend for the FluentAI Knowledge Sharing Platform, built with React, Vite and a clean modular structure.

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

## Auth & routing

- **Auth context**: `AuthContext` stores the current user and JWT token (from backend), exposes `login`, `signup`, and `logout`.
- **Axios**: `apiClient` sets a base URL and attaches `Authorization` header on login/signup, with a 401 interceptor to clear local storage.
- **Routing**: `react-router-dom` provides public routes (`/`, `/login`, `/signup`, `/articles/:id`) and protected routes (`/articles/new`, `/articles/:id/edit`, `/dashboard`) via a small `ProtectedRoute` wrapper in `App.jsx`.
- **Layout**: `MainLayout` wraps all pages with a `Navbar` and a centered main content area.

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

