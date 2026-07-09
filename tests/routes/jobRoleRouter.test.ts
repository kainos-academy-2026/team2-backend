import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindAllOpen = vi.fn();

vi.mock("../../src/services/jobRoleService.js", () => {
	return {
		JobRoleService: class {
			async findAllOpen() {
				return mockFindAllOpen();
			}
		},
	};
});

import jobRoleRouter from "../../src/routes/jobRoleRouter.js";

const TEST_JWT_SECRET = "test-jwt-secret";

function createToken(role: "RECRUITMENT_ADMIN" | "APPLICANT" = "APPLICANT") {
	return jwt.sign({ sub: "user-1", role }, TEST_JWT_SECRET, { expiresIn: "1h" });
}

describe("GET /job-roles", () => {
	const app = express();
	app.use(express.json());
	app.use("/job-roles", jobRoleRouter);

	beforeEach(() => {
		vi.resetAllMocks();
		process.env["JWT_SECRET"] = TEST_JWT_SECRET;
	});

	it("returns 401 when no bearer token is provided", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ error: "Unauthorized" });
	});

	it("returns 200 with mapped role DTOs", async () => {
		const roles = [
			{
				roleName: "Platform Engineer",
				location: "Dublin",
				capability: "Engineering",
				band: "Band 2",
				closingDate: new Date("2026-08-01T00:00:00.000Z"),
			},
		];
		mockFindAllOpen.mockResolvedValue(roles);
		const token = createToken("APPLICANT");

		const response = await request(app)
			.get("/job-roles")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual([
			{
				roleName: "Platform Engineer",
				location: "Dublin",
				capability: "Engineering",
				band: "Band 2",
				closingDate: roles[0]?.closingDate.toISOString(),
			},
		]);
	});

	it("returns 200 with an empty array", async () => {
		mockFindAllOpen.mockResolvedValue([]);
		const token = createToken("RECRUITMENT_ADMIN");

		const response = await request(app)
			.get("/job-roles")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual([]);
	});

	it("returns 500 when the service fails", async () => {
		mockFindAllOpen.mockRejectedValue(new Error("db timeout"));
		const token = createToken("RECRUITMENT_ADMIN");

		const response = await request(app)
			.get("/job-roles")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: "Internal server error" });
	});
});
