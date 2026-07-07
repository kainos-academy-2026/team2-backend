# Team 2 Applications

This repository currently contains the API application.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (or Docker Engine + Docker Compose)

## Environment Variables

Create a `.env` file in the repository root:

```bash
PORT=3000
DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/jobs_db"
```


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

### Typical Local Startup Flow

```bash
docker compose up -d
npm install
npx prisma migrate dev --name init
npm run dev
```

### Health Check

When the API is running, verify:

```bash
curl http://localhost:3000/health
```
