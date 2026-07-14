import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockApplyForRole = vi.fn();

vi.mock("../../src/services/jobApplicationService.js", () => {
	return {
		JobApplicationService: class {
			async applyForRole(input: unknown) {
				return mockApplyForRole(input);
			}
		},
	};
});

import jobRoleRouter from "../../src/routes/jobRoleRouter.js";

describe("POST /job-roles/:id/applications", () => {
	const app = express();
	app.use(express.json());
	app.use("/job-roles", jobRoleRouter);

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns 201 when application is created", async () => {
		mockApplyForRole.mockResolvedValue({
			applicationId: 5,
			jobRoleId: 1,
			userId: 2,
			cvUrl: "https://bucket.s3.eu-west-1.amazonaws.com/cv.pdf",
			status: "IN_PROGRESS",
			createdAt: "2026-07-14T12:00:00.000Z",
		});

		const response = await request(app)
			.post("/job-roles/1/applications")
			.field("userId", "2")
			.attach("cv", Buffer.from("dummy cv"), "cv.pdf");

		expect(response.status).toBe(201);
		expect(response.body).toEqual({
			applicationId: 5,
			jobRoleId: 1,
			userId: 2,
			cvUrl: "https://bucket.s3.eu-west-1.amazonaws.com/cv.pdf",
			status: "IN_PROGRESS",
			createdAt: "2026-07-14T12:00:00.000Z",
		});
	});

	it("returns 400 when cv file is missing", async () => {
		const response = await request(app)
			.post("/job-roles/1/applications")
			.field("userId", "2");

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ message: "CV file is required" });
	});

	it("returns 400 when userId is invalid", async () => {
		const response = await request(app)
			.post("/job-roles/1/applications")
			.field("userId", "abc")
			.attach("cv", Buffer.from("dummy cv"), "cv.pdf");

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
	});

	it("returns 500 when service fails", async () => {
		mockApplyForRole.mockRejectedValue(new Error("boom"));

		const response = await request(app)
			.post("/job-roles/1/applications")
			.field("userId", "2")
			.attach("cv", Buffer.from("dummy cv"), "cv.pdf");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ message: "Internal server error" });
	});
});
