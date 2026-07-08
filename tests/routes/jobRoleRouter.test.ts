import express from "express";
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
