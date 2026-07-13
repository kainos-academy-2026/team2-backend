import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindAllOpen = vi.fn();
const mockFindById = vi.fn();

vi.mock("../../src/services/jobRoleService.js", () => {
	return {
		JobRoleService: class {
			async findAllOpen() {
				return mockFindAllOpen();
			}

			async findById() {
				return mockFindById();
			}
		},
	};
});

import jobRoleRouter from "../../src/routes/jobRoleRouter.js";

describe("GET /job-roles", () => {
	const app = express();
	app.use(express.json());
	app.use("/job-roles", jobRoleRouter);

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns 200 with mapped role DTOs", async () => {
		const roles = [
			{
				roleName: "Platform Engineer",
				location: "Dublin",
				capability: "Engineering",
				band: "Band 2",
				closingDate: new Date("2026-08-01T00:00:00.000Z"),
				status: "OPEN",
				description: "Build and maintain platform services.",
				responsibilities: ["Develop APIs", "Maintain CI/CD pipelines"],
				sharepointUrl: "https://example.com/job-role/1",
				numberOfOpenPositions: 3,
			},
		];
		mockFindAllOpen.mockResolvedValue(roles);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.body).toEqual([
			{
				roleName: "Platform Engineer",
				location: "Dublin",
				capability: "Engineering",
				band: "Band 2",
				closingDate: roles[0]?.closingDate.toISOString(),
				status: "OPEN",
				description: "Build and maintain platform services.",
				responsibilities: ["Develop APIs", "Maintain CI/CD pipelines"],
				sharepointUrl: "https://example.com/job-role/1",
				numberOfOpenPositions: 3,
			},
		]);
	});

	it("returns 200 with an empty array", async () => {
		mockFindAllOpen.mockResolvedValue([]);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.body).toEqual([]);
	});

	it("returns 500 when the service fails", async () => {
		mockFindAllOpen.mockRejectedValue(new Error("db timeout"));

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: "Internal server error" });
	});
});

describe("GET /job-roles/:id", () => {
	const app = express();
	app.use(express.json());
	app.use("/job-roles", jobRoleRouter);

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns 200 with mapped role DTO when found", async () => {
		const role = {
			jobRoleId: 1,
			roleName: "Software Engineer",
			location: "Dublin",
			capability: "Engineering",
			band: "Band 2",
			closingDate: "2026-08-01T00:00:00.000Z",
			status: "OPEN",
			description: "Build APIs.",
			responsibilities: ["Write code"],
			sharepointUrl: "https://example.com/role/1",
			numberOfOpenPositions: 2,
		};
		mockFindById.mockResolvedValue(role);

		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.body).toEqual(role);
	});

	it("returns 404 when job role not found", async () => {
		mockFindById.mockResolvedValue(null);

		const response = await request(app).get("/job-roles/999");

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ message: "Job role not found" });
	});

	it("returns 404 when job role ID is not found", async () => {
		const response = await request(app).get("/job-roles/invalid");

		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty("message");
	});

	it("returns 500 when service fails", async () => {
		mockFindById.mockRejectedValue(new Error("db connection lost"));

		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ message: "Internal server error" });
	});
});
