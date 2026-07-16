---
applyTo: "**/src/*.ts,*.js" 
---

# US041 - Authorisation System

## User Story
As a platform user, I want role-based access control so that only authorised users can access protected API routes and perform privileged actions.

## Scope
- Backend API authorisation for authenticated and unauthenticated users.
- JWT-based authentication and role-based authorisation.
- Seed data required to test role behaviour.

## Roles
- `admin`: Full access to protected API endpoints.
- `user`: Read-only access to list and information endpoints.

## Authentication Rules
- All API routes are protected by JWT token **except**:
	- `POST /login`
	- `POST /register`
	- `GET /health`
- Protected routes must require header format:
	- `Authorization: Bearer <token>`

## Authorisation Rules
- `admin` can access all protected routes and methods.
- `user` can access read-only protected routes (list and details) only.
- `user` must be denied for create/update/delete protected methods.

## Expected API Behaviour
- Missing token on protected route: `302` redirect to `/login`.
- Invalid/expired token on protected route: `302` redirect to `/login`.
- Valid token but insufficient role: `403` with JSON:
	- `{ "message": "Forbidden" }`

## Endpoint Access Matrix
- `POST /login`: Public
- `POST /register`: Public
- `GET /health`: Public
- `GET /job-roles`: `user`, `admin`
- `GET /job-roles/:id`: `user`, `admin`
- Non-GET protected endpoints (current and future): `admin` only

## JWT Claims Contract
Token payload must include:
- `sub`: user id
- `name`: user full name
- `email`: user email
- `role`: `user` or `admin`

## Seed Data Requirements
Seed at least one account per role for manual/API testing:
- user account:
	- email: `applicant.seed@example.com`
	- password: `Applicant!123`
	- role: `user`
- admin account:
	- email: `admin.seed@example.com`
	- password: `Admin!12345`
	- role: `admin`

Seed should upsert these users so rerunning seed keeps role values aligned with this story.

## Acceptance Criteria
1. Given no token, when calling `GET /job-roles`, then response is `302` and `Location` is `/login`.
2. Given an invalid token, when calling `GET /job-roles`, then response is `302` and `Location` is `/login`.
3. Given valid `user` token, when calling `GET /job-roles`, then response is `200`.
4. Given valid `user` token, when calling `GET /job-roles/:id` with valid id, then response is `200`.
5. Given valid `user` token, when calling protected non-GET endpoint, then response is `403` with `{ "message": "Forbidden" }`.
6. Given valid `admin` token, when calling protected non-GET endpoint, then response is not blocked by role middleware.
7. `POST /login` and `POST /register` are callable without token.
8. `GET /health` is callable without token.

## Test Coverage Expectations
- Unit tests for authentication middleware:
	- missing token
	- invalid token
	- valid token claim parsing
- Unit tests for role guard:
	- allowed role passes
	- disallowed role returns `403`
- Route/integration tests covering:
	- public endpoints
	- protected endpoint redirect behaviour
	- `user` read-only access
	- `admin` privileged access path