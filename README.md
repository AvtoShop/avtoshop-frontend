# AvtoShop

AvtoShop is a Vite + React frontend for an auto service website. It includes a public landing page, administrator login, and a protected admin panel for managing services.

This repository contains the frontend only. The backend API contract is described in [`openapi.json`](./openapi.json).

## Features

- Public marketing page for the service center
- Services and reviews loaded from the backend with local fallback data
- Review submission with offline-safe fallback behavior
- Admin login and protected admin area
- Service create, update, and delete flows in the admin panel

## Routes

- `/` public landing page
- `/login` administrator login
- `/admin` protected admin panel

## Stack

- React 19
- TypeScript
- Vite
- React Router
- MobX
- Tailwind CSS
- Axios
- Vitest

## Development

```bash
npm install
npm run dev
```

## Build And Test

```bash
npm run build
npm test
```

## Environment

The app resolves the backend base URL from:

- `VITE_BACKEND_API_BASE_URL`
- fallback: `BACKEND_API_BASE_URL`

If the value does not end with `/api`, the app appends `/api` automatically.

Current default backend:

```text
https://convulsively-central-greyhound.cloudpub.ru/api
```

Example:

```bash
VITE_BACKEND_API_BASE_URL=http://localhost:5000
```

## Related

- [`openapi.json`](./openapi.json)
- [`BACKEND_BUILD_BRIEF.md`](./BACKEND_BUILD_BRIEF.md)
