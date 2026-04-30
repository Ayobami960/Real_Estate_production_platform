### Real Estate Management Application

## Overview

This project is a full-stack Real Estate Management application with separate frontend and backend layers.

## Frontend

- Built with React
- Uses `react-router-dom` for routing
- Authentication page includes:
  - email and password input
  - client-side validation
  - input sanitization
  - password show/hide toggle
  - toast notifications with `react-hot-toast`
  - login lockout after repeated failed attempts
  - role-based redirect after login
- Supports user roles:
  - `admin` → `/admin-dashboard`
  - `seller` → `/dashboard`
  - default → `/`

## Backend

- Provides authentication endpoints
- Supports login and role-based session handling
- Designed to support property and user management
- Works with frontend login flow using stored user data in `localStorage` or `sessionStorage`

## Key Features

- Full-stack login flow
- Frontend validation and sanitization
- Login attempt tracking and temporary lockout
- Clear UI warnings for lockout and remaining attempts
- Role-aware navigation
- Basic forgot password and registration links

## Project Structure

- `clients/` — React frontend
- `server/` — backend API service
- `src/utils/` — validation and sanitization helpers
- `src/components/` — shared UI components

## Setup

1. Frontend
   - `cd clients`
   - `npm install`
   - `npm start`

2. Backend
   - `cd server`
   - `npm install`
   - `npm run dev` or `npm start`

## Notes

- Configure backend API URL, database connection, and auth secrets as environment variables.
- The frontend reads stored user information on login to decide dashboard navigation.
- Validation helpers include `sanitizeInput`, `validateEmail`, and `validateLoginPassword`.