import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

const TEST_ROLE_PREFIX = "Integration Add Role";
const ADMIN_EMAIL = "admin.seed@example.com";
const ADMIN_PASSWORD = "Admin!12345";
const USER_EMAIL = "applicant.seed@example.com";
const USER_PASSWORD = "Applicant!123";

const buildRoleName = () => `${TEST_ROLE_PREFIX} ${Date.now()}`;

const cleanCreatedRoles = async (): Promise<void> => {
	await prisma.jobRole.deleteMany({
		where: {
			roleName: {
				startsWith: TEST_ROLE_PREFIX,
			},
		},
	});
};

const loginAndGetToken = async (
	email: string,
	password: string,
): Promise<string> => {
	const response = await request(app).post("/login").send({ email, password });

	expect(response.status).toBe(200);
	expect(typeof response.body.token).toBe("string");
	return response.body.token as string;
};

describe("Integration: add job role", () => {
	beforeEach(async () => {
		await cleanCreatedRoles();
	});

	afterEach(async () => {
		await cleanCreatedRoles();
	});

	it("allows an admin to create a job role and persists it", async () => {
		const [band, capability] = await Promise.all([
			prisma.band.findFirst(),
			prisma.capability.findFirst(),
		]);

		expect(band).not.toBeNull();
		expect(capability).not.toBeNull();

		const token = await loginAndGetToken(ADMIN_EMAIL, ADMIN_PASSWORD);
		const roleName = buildRoleName();

		const payload = {
			name: roleName,
			location: "Belfast",
			capabilityId: capability?.capabilityId,
			bandId: band?.nameId,
			closingDate: "2026-12-31",
			description: "Integration test role",
			sharepointUrl: "https://example.com/integration-role",
			responsibilities: ["Validate end-to-end role creation"],
			numberOfOpenPositions: 1,
		};

		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${token}`)
			.send(payload);

		expect(response.status).toBe(201);
		expect(response.body.roleName).toBe(roleName);
		expect(response.body.location).toBe("Belfast");
		expect(response.body.status).toBe("OPEN");

		const persisted = await prisma.jobRole.findFirst({
			where: {
				roleName,
			},
		});

		expect(persisted).not.toBeNull();
		expect(persisted?.location).toBe("Belfast");
		expect(persisted?.status).toBe("OPEN");
		expect(persisted?.numberOfOpenPositions).toBe(1);
	});

	it("rejects non-admin users with 403", async () => {
		const [band, capability] = await Promise.all([
			prisma.band.findFirst(),
			prisma.capability.findFirst(),
		]);

		expect(band).not.toBeNull();
		expect(capability).not.toBeNull();

		const token = await loginAndGetToken(USER_EMAIL, USER_PASSWORD);
		const roleName = buildRoleName();

		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${token}`)
			.send({
				name: roleName,
				location: "Belfast",
				capabilityId: capability?.capabilityId,
				bandId: band?.nameId,
				closingDate: "2026-12-31",
			});

		expect(response.status).toBe(403);
		expect(response.body).toEqual({ message: "Forbidden" });

		const persisted = await prisma.jobRole.findFirst({
			where: {
				roleName,
			},
		});

		expect(persisted).toBeNull();
	});

	it("returns 400 when reference data IDs are invalid", async () => {
		const token = await loginAndGetToken(ADMIN_EMAIL, ADMIN_PASSWORD);

		const response = await request(app)
			.post("/job-roles")
			.set("Authorization", `Bearer ${token}`)
			.send({
				name: buildRoleName(),
				location: "Belfast",
				capabilityId: 999999,
				bandId: 999999,
				closingDate: "2026-12-31",
			});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ message: "Invalid band or capability" });
	});
});
