# Team 2 Applications

This repository currently contains the API application.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (or Docker Engine + Docker Compose)

## Environment Variables

Create a `.env` file in the repository root:

```bash
PORT=3001
DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/jobs_db"
CORS_ORIGIN="http://localhost:3001"
```

`CORS_ORIGIN` is optional and defaults to `http://localhost:3001`.

## API Application (this repository)

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Build production output:

```bash
npm run build
```

Run built output:

```bash
npm run start
```

Lint API code:

```bash
npm run lint
```

Lint and auto-fix API code:

```bash
npm run lint:fix
```

Lint and auto-fix API code (including unsafe fixes):

```bash
npm run lint:fix -- --unsafe
```

### API Testing

Run all tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Docker (PostgreSQL)

Start the local PostgreSQL container:

```bash
docker compose up -d
```

Stop containers:

```bash
docker compose down
```

Stop containers and remove the DB volume:

```bash
docker compose down -v
```

### API Migrations

Create and apply a new migration:

```bash
npx prisma migrate dev --name <migration_name>
```

Generate Prisma client (run this after pulling schema changes):

```bash
npx prisma generate
```

Check migration status:

```bash
npx prisma migrate status
```

Reset the development database and re-run migrations:

```bash
npx prisma migrate reset
```

Open Prisma Studio:

```bash
npx prisma studio
```

### Database Seeding

Populate the database with starter data:

```bash
npx prisma db seed
```

The seed command is configured in `prisma.config.ts` and runs:

```bash
node prisma/seed.js
```

If you reset the database, run seed again after migrations:

```bash
npx prisma migrate reset
npx prisma db seed
```

### Typical Local Startup Flow

```bash
docker compose up -d
npm install
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
npm run dev
```

## API Endpoints

- `GET /` returns a basic API overview.
- `GET /health` returns `{ status: "UP", timestamp: "..." }`.
- `GET /job-roles` returns open job roles.
- `GET /job-roles/:id` returns a single job role by ID or `404` if not found.
- `POST /` registers a user account.

Job role responses currently include:

- `jobRoleId`
- `roleName`
- `location`
- `capability`
- `band`
- `closingDate`
- `status`
- `description`
- `responsibilities`
- `sharepointUrl`
- `numberOfOpenPositions`

## Quick Checks

When the API is running, verify root and health:

```bash
curl http://localhost:3001/
curl http://localhost:3001/health
```

Check open roles:

```bash
curl http://localhost:3001/job-roles
```
