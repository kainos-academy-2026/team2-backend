import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const databaseUrl =
	process.env.DATABASE_URL ??
		(process.env.NODE_ENV === "production" ? undefined : "file:./dev.db");

if (!databaseUrl) {
	throw new Error("DATABASE_URL must be set in production");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

export const prisma = new PrismaClient({ adapter });
