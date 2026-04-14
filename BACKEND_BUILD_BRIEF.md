# Backend Build Brief for AvtoShop

## Summary

Build a production-oriented backend service for the existing AvtoShop frontend in this repository. The current codebase is a Vite React application with a public landing page, a testimonial submission flow, and an admin panel for service management. The backend is missing from the repo and must become the source of truth for services, reviews, and administrator authentication.

This brief is intended as a decision-complete handoff for another agent. The backend should use persistent storage, real authentication, validation, and stable API contracts. The implementation stack is not fixed, but the delivered behavior and interfaces should match this document.

## Project Context

- The frontend app lives in this repository and uses `react-router-dom` routes for `/`, `/login`, and `/admin`.
- Public UI sections include marketing content, services, testimonials, and contact details.
- The admin UI currently supports create, edit, and delete actions for services.
- Dynamic frontend behavior is implemented in:
  - `src/lib/api.js`
  - `src/components/Login.jsx`
  - `src/components/AdminPanel.jsx`
  - `src/components/Testimonials.jsx`
  - `src/components/ProtectedRoute.jsx`
- The current frontend contains demo and fallback behavior because no backend is present.

## Current Frontend Contract

The frontend currently calls `http://localhost:5000/api` and expects these endpoints:

### Services

- `GET /api/posts`
- `POST /api/posts`
- `PUT /api/post/:id`
- `DELETE /api/post/:id`

### Reviews

- `GET /api/reviews`
- `POST /api/reviews`

### Authentication

- Historically expected: `POST /api/login`
- Current reality: the login page no longer calls the backend and instead sets local admin state directly for demo access

The frontend also falls back to local mock data when services or reviews cannot be loaded from the server.

## Required Backend Scope

Implement three backend domains:

1. Authentication
2. Services management
3. Reviews

The backend must provide:

- persistent storage
- input validation
- structured JSON responses
- consistent error handling
- environment-based configuration
- CORS support for local frontend development

In-memory-only storage is not acceptable for the target solution.

## Recommended API Contract

Do not preserve the current singular and plural route inconsistency as the long-term contract. Normalize the API around resource-oriented naming and either update the frontend accordingly or provide temporary compatibility aliases for the old routes.

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/logout` or an explicit stateless token invalidation policy

### Services

- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

### Reviews

- `GET /api/reviews`
- `POST /api/reviews`

### Transition Requirement

The implementing agent must choose one of these transition strategies:

- preferred: update the frontend from `/api/posts` and `/api/post/:id` to `/api/services` and `/api/services/:id`
- acceptable during migration: add compatibility aliases for the legacy routes while keeping the normalized API as the main contract

The cleaned contract is the intended long-term interface.

## Public Interfaces and Response Shapes

Define and return JSON in a stable, frontend-consumable shape.

### Service

```ts
type Service = {
  id: string | number;
  name: string;
  icon: string;
  description: string;
  price: string;
  createdAt: string;
  updatedAt: string;
};
```

### Review

```ts
type Review = {
  id: string | number;
  name: string;
  text: string;
  rating: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Auth Login Request

```ts
type AuthLoginRequest = {
  email: string;
  password: string;
};
```

### Auth Login Response

```ts
type AuthLoginResponse = {
  user: {
    id: string | number;
    email: string;
    role: string;
  };
  token?: string;
  session?: {
    id: string;
    expiresAt: string;
  };
};
```

### Error Response

Use a consistent high-level error shape across the API.

```ts
type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

- Return `4xx` responses for validation failures, auth failures, and missing resources.
- Return `5xx` responses for unexpected server errors.

## Authentication Requirements

Real admin authentication is required. Do not keep the current demo-only auth behavior as the final system.

The backend must implement:

- secure password hashing
- authenticated admin login
- route protection for service create, update, and delete
- clear unauthorized and forbidden responses
- a seed or bootstrap path for at least one admin account

Default auth assumption:

- use JWT bearer authentication unless the implementing agent has a strong repo-level reason to use secure cookie sessions instead

Minimum admin user model:

```ts
type AdminUser = {
  id: string | number;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};
```

## Data and Validation Requirements

### Services

Validation rules:

- `name` is required
- `icon` is required if the frontend continues to collect and display it
- `description` is required
- `price` is required

Behavior requirements:

- create returns the persisted service record
- update returns the updated service record
- delete returns a success status or a standard no-content response
- list returns records in a shape directly usable by the frontend

### Reviews

Validation rules:

- `name` is required
- `text` is required
- `rating` must be an integer from `1` to `5`

Behavior requirements:

- public users can list reviews
- public users can submit reviews unless product requirements later add moderation or anti-spam controls
- if moderation is added, document the default review status and admin workflow clearly

## Frontend-Backend Alignment Notes

The current frontend has several mismatches and temporary behaviors that must be addressed during integration:

- `src/components/Login.jsx` bypasses the backend and grants admin access locally
- `src/components/ProtectedRoute.jsx` checks only local storage state
- `src/lib/api.js` uses legacy `/posts` and `/post/:id` service routes
- services and reviews use mock fallback data when the backend is unavailable
- admin mutations fall back to local-only demo state if service requests fail

Required integration direction:

- preserve graceful loading and error states
- remove demo-only authentication bypass when real auth is wired in
- connect login to the real auth endpoint
- store and apply real authentication state in the frontend
- either migrate the frontend to normalized service endpoints or keep temporary compatibility routes on the backend until the frontend is updated

The goal is to keep the user experience resilient without hiding backend failures behind permanent demo logic.

## Operational Requirements

Support environment-based configuration through a `.env` file or equivalent configuration system.

Minimum configuration should cover:

- API port
- database connection string or database config
- auth secret or signing key
- CORS origin for the frontend
- admin seed credentials policy

Operational expectations:

- support local frontend development against the API
- expose CORS only to the intended frontend origin(s)
- provide a repeatable way to seed at least one admin user
- optionally seed sample services and reviews for local development

## Acceptance Criteria

The backend is complete when all of the following are true:

- the frontend can load services from persistent backend storage
- the frontend can load reviews from persistent backend storage
- admin login is real and required for service mutations
- authenticated admin users can create, edit, and delete services
- review submission persists valid data and returns a usable response
- invalid payloads return structured validation errors
- unauthorized service mutations return structured auth errors
- local integration no longer depends on demo auth to reach admin functionality
- the long-term API contract is normalized around `/api/services` and `/api/auth/login`, with frontend updates or compatibility routing implemented explicitly

## Test Cases and Scenarios

The implementing agent should cover at least these scenarios:

- `GET /api/services` returns persisted services in the expected shape
- `POST /api/services` rejects unauthenticated requests
- `PUT /api/services/:id` rejects unauthenticated requests
- `DELETE /api/services/:id` rejects unauthenticated requests
- authenticated admin login succeeds with valid credentials
- authenticated admin login fails with invalid credentials
- authenticated admin can create a service
- authenticated admin can update a service
- authenticated admin can delete a service
- `GET /api/reviews` returns persisted reviews
- `POST /api/reviews` accepts valid payloads
- `POST /api/reviews` rejects invalid ratings and empty text
- local frontend development works with CORS enabled for the frontend origin
- if legacy service routes are kept temporarily, both the normalized and compatibility routes behave consistently during the migration window

## Assumptions and Defaults

- The backend will be implemented as a separate service consumed by this frontend.
- The implementation stack is flexible, but the contract and behavior in this document are fixed requirements.
- JWT bearer auth is the default unless secure cookie sessions are chosen for a documented reason.
- Persistent database-backed storage is required.
- The preferred long-term frontend contract uses:
  - `POST /api/auth/login`
  - `GET /api/services`
  - `POST /api/services`
  - `PUT /api/services/:id`
  - `DELETE /api/services/:id`
  - `GET /api/reviews`
  - `POST /api/reviews`
