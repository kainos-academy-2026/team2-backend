# Team 2 Applications

This repository currently contains the API application.

## Prerequisites

- Node.js 20+
- npm 10+

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

Unit test scripts are not configured in this repository yet.

Planned/expected scripts once testing is added:

```bash
npm run test
npm run test:ui
npm run test:coverage
```

### API Migrations

Database migration tooling is not configured in this repository yet (no Prisma configuration/scripts detected).

If Prisma is added later, common migration commands are:

```bash
npx prisma migrate dev --name <migration_name>
npx prisma migrate status
npx prisma migrate reset
```

## UI Application

The UI application is not part of this repository.

If your UI lives in a separate folder/repository, open that project and run its scripts from that directory. Typical scripts are:

```bash
npm run dev
npm run build
npm run test
npm run test:ui
npm run test:coverage
npm run lint
npm run lint:fix
```

Check the UI package.json to confirm the exact script names.
