# AvtoShop Project Description

## Overview

AvtoShop is a React-based frontend project for an auto service landing page. The application presents an auto repair business in Tikhoretsk, Russia, and includes public marketing sections together with a partially implemented admin workflow.

The current repository contains the frontend only. Several parts of the UI depend on an external backend API running at `http://localhost:5000`.

## Purpose

This project is intended to:

- present the auto service and its core value proposition
- show available services and pricing
- display customer testimonials
- provide contact information and a map
- offer a login screen and an admin panel for service management

## Tech Stack

- React 19
- `react-router-dom` 7
- CSS modules by feature area via separate stylesheet files
- `axios` and `fetch` for HTTP requests
- `react-scripts` for development, build, and test workflows

## Application Structure

### Entry Points

- `src/index.js` bootstraps the React app
- `src/App.js` defines the main router structure

### Routes

- `/` renders the public landing page
- `/login` renders the admin login page
- `/admin` renders the admin panel behind a protected route

### Main UI Sections

The landing page is composed of these components:

- `Header`
- `Hero`
- `Services`
- `Advantages`
- `About`
- `Testimonials`
- `Contact`
- `Footer`

### Admin-Related Components

- `src/components/Login.jsx` handles admin login form submission
- `src/components/AdminPanel.jsx` provides CRUD-style UI for services
- `src/components/ProtectedRoute.jsx` gates the `/admin` route

## Runtime Behavior

### Public Landing Page

The root route renders a one-page marketing interface for the auto service. It includes:

- a hero block with business positioning and quick contact details
- a services section loaded from the backend API
- a static advantages section
- an about section with simple scroll-based animation
- a testimonials section loaded from the backend API with a review submission form
- a contact section with address, phone numbers, and embedded Yandex map

### Login Flow

The login screen sends admin credentials to the backend. On successful login, the frontend stores an admin flag in `localStorage` and redirects the user to `/admin`.

### Admin Panel

The admin panel loads services from the backend and allows:

- listing services
- creating a new service
- editing an existing service
- deleting a service

## External API Dependencies

The frontend currently expects these backend endpoints to exist at `http://localhost:5000`:

### Services

- `GET /api/posts` to load services
- `POST /api/posts` to create a service
- `PUT /api/post/:id` to update a service
- `DELETE /api/post/:id` to delete a service

### Reviews

- `GET /api/reviews` to load testimonials
- `POST /api/reviews` to submit a testimonial

### Authentication

- `POST /api/login` to authenticate an admin user

## Current State and Known Issues

This repository does not currently include the backend implementation. The UI is therefore only partially functional unless a compatible API is provided separately.

Known issues observed in the current codebase:

- `Login.jsx` stores `myProject_isAdmin` in `localStorage`, but `ProtectedRoute.jsx` checks `isAdmin`
- `Header.jsx` uses a separate `token` check for auth-related UI state, which does not match the admin flag logic
- footer contact data does not fully match the contact section
- some anchor targets are inconsistent: navigation links use `#reviews`, while the testimonials section uses `id="testimonials"`
- the current local test run fails in `src/App.test.js` with `Cannot find module 'react-router-dom' from 'src/App.js'`
- the repository history suggests backend files existed earlier, but they are not present in the current working tree

## Repository Layout

Relevant files and directories:

- `package.json` - frontend dependencies and scripts
- `src/App.js` - route composition
- `src/components/` - page and admin components
- `src/styles/` - component-specific styles
- `public/` - static frontend assets

## Running the Frontend

Install dependencies and start the development server:

```bash
npm install
npm start
```

Important note: dynamic sections such as services, testimonials, login, and admin management require a separate backend service compatible with the API described above.

## Recommended Context for Another AI

When using this repository as context for another AI agent, treat it as:

- a frontend-first educational or portfolio-style React project
- a landing page with partial CMS/admin intentions
- a codebase with UI coverage in place, but incomplete integration consistency
- a project that likely needs auth cleanup, API contract validation, and test stabilization before being considered production-ready
