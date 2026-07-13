#!/usr/bin/env node
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
async function main() {
	const engineering = await prisma.capability.upsert({
		where: { capabilityId: 1 },
		update: {},
		create: {
			capabilityName: "Engineering",
		},
	});
	const consulting = await prisma.capability.upsert({
		where: { capabilityId: 2 },
		update: {},
		create: {
			capabilityName: "Consulting",
		},
	});
	const band2 = await prisma.band.upsert({
		where: { nameId: 1 },
		update: {},
		create: {
			bandName: "Band 2",
		},
	});
	const band3 = await prisma.band.upsert({
		where: { nameId: 2 },
		update: {},
		create: {
			bandName: "Band 3",
		},
	});
	await prisma.jobRole.createMany({
		data: [
			{
				roleName: "Software Engineer",
				location: "Belfast",
				capabilityId: engineering.capabilityId,
				bandId: band2.nameId,
				closingDate: new Date("2026-08-15T00:00:00.000Z"),
				status: "OPEN",
				description: "Build and maintain backend services.",
				responsibilities: ["Develop APIs", "Review code", "Support releases"],
				sharepointUrl: "https://example.com/job-role/software-engineer",
				numberOfOpenPositions: 3,
			},
			{
				roleName: "Platform Engineer",
				location: "Dublin",
				capabilityId: engineering.capabilityId,
				bandId: band3.nameId,
				closingDate: new Date("2026-09-01T00:00:00.000Z"),
				status: "OPEN",
				description: "Own CI/CD and platform tooling.",
				responsibilities: [
					"Improve pipelines",
					"Maintain infrastructure",
					"Automate deployments",
				],
				sharepointUrl: "https://example.com/job-role/platform-engineer",
				numberOfOpenPositions: 2,
			},
			{
				roleName: "Business Analyst",
				location: "London",
				capabilityId: consulting.capabilityId,
				bandId: band2.nameId,
				closingDate: new Date("2026-07-01T00:00:00.000Z"),
				status: "CLOSED",
				description: "Gather requirements and shape delivery scope.",
				responsibilities: [
					"Run stakeholder workshops",
					"Document requirements",
					"Support roadmap planning",
				],
				sharepointUrl: "https://example.com/job-role/business-analyst",
				numberOfOpenPositions: 1,
			},
		],
		skipDuplicates: true,
	});

	const _user = await prisma.user.upsert({
		where: { email: "exampleuser1@hotmail.com" },
		update: {},
		create: {
			email: "exampleuser1@hotmail.com",
			passwordHash: await argon2.hash("password123"),
			fullName: "Tim Cassells",
			role: "USER",
		},
	});

	const _admin = await prisma.user.upsert({
		where: { email: "admin@exampleadmin.com" },
		update: {},
		create: {
			email: "admin@exampleadmin.com",
			passwordHash: await argon2.hash("adminpassword"),
			fullName: "Woody Henderson",
			role: "ADMIN",
		},
	});

	console.log("Seed data created successfully");
}
main()
	.catch((error) => {
		console.error("Seed failed", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
//# sourceMappingURL=seed.js.map
