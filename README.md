# AvtoShop

AvtoShop is a Vite + React frontend for an auto service website with a public landing page, testimonial flow, administrator login, and a protected admin panel for managing services.

The repository contains the frontend application only. It integrates with an external backend API described in [`openapi.json`](./openapi.json).

## What is in the app

- Public marketing page with sections for hero, services, advantages, about, testimonials, and contacts
- Dynamic service catalog loaded from API with local fallback data
- Testimonial list and submission form with offline-safe fallback behavior
- Admin login via backend authentication
- Protected admin panel for creating, editing, and deleting services

## Tech stack

- React 19
- TypeScript
- Vite
- React Router 7
- MobX + `mobx-react-lite`
- Tailwind CSS
- Axios
- Vitest + Testing Library
- Vercel Analytics

## Routes

- `/` public landing page
- `/login` administrator login
- `/admin` protected service management page

## Project structure

```text
src/
  app/                 app shell, router, providers, stores
  pages/
    home/              public landing page
    login/             admin login page
    admin/             protected admin page
  shared/
    api/               HTTP client and API modules
    config/            environment and content constants
    mocks/             fallback data for services and reviews
    model/             shared TypeScript types
    ui/                shared layout and UI primitives
```

The page modules follow a view-model split:

- `page.tsx` wires dependencies
- `model/` contains state and async logic
- `ui/` contains presentation components

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Test commands

```bash
npm test
npm run test:coverage
```

## Environment variables

The frontend resolves backend origin from:

- `VITE_BACKEND_API_BASE_URL`
- fallback: `BACKEND_API_BASE_URL`

If the value does not end with `/api`, the app appends `/api` automatically.

Current default fallback in code:

```text
https://convulsively-central-greyhound.cloudpub.ru/api
```

Example `.env.local`:

```bash
VITE_BACKEND_API_BASE_URL=http://localhost:5000
```

This becomes `http://localhost:5000/api` inside the app.

## Backend integration

The backend is not implemented in this repository, but the frontend is already wired to the current API contract.

Main endpoints:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`
- `GET /api/reviews`
- `POST /api/reviews`

The OpenAPI description is stored in [`openapi.json`](./openapi.json).

The spec also exposes legacy compatibility routes:

- `GET /api/posts`
- `POST /api/posts`
- `PUT /api/post/:id`
- `DELETE /api/post/:id`

## Runtime behavior

### Public page

- Services are requested from the backend
- Reviews are requested from the backend
- If the backend is unavailable or returns an empty list, the UI falls back to local mock content
- Review submission also has an offline-safe fallback so the form still behaves predictably

### Authentication

- Admin login sends credentials to the backend
- The app stores the returned token and user object in `localStorage`
- The storage key is `avtoshop_admin_session`
- `/admin` is guarded by `ProtectedRoute`

### Admin panel

- Requires a valid authenticated session
- Loads current services
- Supports create, update, and delete operations through the backend API
- If services are shown from fallback data, mutations are disabled and the UI switches to preview-only mode

## Notes

- The repository currently includes generated build output in `dist/`
- Contact copy and brand content are centralized in [`src/shared/config/content.ts`](./src/shared/config/content.ts)
- API base URL logic is defined in [`src/shared/config/env.ts`](./src/shared/config/env.ts)

## Related docs

- [`PROJECT_DESCRIPTION.md`](./PROJECT_DESCRIPTION.md) historical project summary
- [`BACKEND_BUILD_BRIEF.md`](./BACKEND_BUILD_BRIEF.md) backend implementation brief
- [`openapi.json`](./openapi.json) API contract
