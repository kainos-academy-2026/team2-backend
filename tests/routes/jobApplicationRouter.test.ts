import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateCvUploadUrl = vi.fn();
const mockApplyForRole = vi.fn();

vi.mock("../../src/services/jobApplicationService.js", () => {
	return {
		JobApplicationService: class {
			async createCvUploadUrl(input: unknown) {
				return mockCreateCvUploadUrl(input);
			}

			async applyForRole(input: unknown) {
				return mockApplyForRole(input);
			}
		},
	};
});

import jobRoleRouter from "../../src/routes/jobRoleRouter.js";

describe("Job application routes", () => {
	const app = express();
	app.use(express.json());
	app.use("/job-roles", jobRoleRouter);

	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("POST /job-roles/:id/applications/upload-url", () => {
		it("returns 200 when upload URL is created", async () => {
			mockCreateCvUploadUrl.mockResolvedValue({
				cvKey: "cvs/job-role-1/user-2/1-cv.pdf",
				uploadUrl: "https://signed.example.com/upload",
			});

			const response = await request(app)
				.post("/job-roles/1/applications/upload-url")
				.send({
					userId: 2,
					fileName: "cv.pdf",
					contentType: "application/pdf",
				});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				cvKey: "cvs/job-role-1/user-2/1-cv.pdf",
				uploadUrl: "https://signed.example.com/upload",
			});
		});

		it("returns 400 when upload URL payload is invalid", async () => {
			const response = await request(app)
				.post("/job-roles/1/applications/upload-url")
				.send({ userId: "abc" });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("message");
		});

		it("returns 400 when contentType is not application/pdf", async () => {
			const response = await request(app)
				.post("/job-roles/1/applications/upload-url")
				.send({
					userId: 2,
					fileName: "cv.docx",
					contentType:
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				});

			expect(response.status).toBe(400);
			expect(response.body).toEqual({
				message: "Only PDF files are supported",
			});
		});
	});

	describe("POST /job-roles/:id/applications", () => {
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
				.send({ userId: 2, cvKey: "cvs/job-role-1/user-2/1-cv.pdf" });

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

		it("returns 400 when cvKey is missing", async () => {
			const response = await request(app)
				.post("/job-roles/1/applications")
				.send({ userId: 2 });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("message");
		});

		it("returns 400 when userId is invalid", async () => {
			const response = await request(app)
				.post("/job-roles/1/applications")
				.send({ userId: "abc", cvKey: "cvs/job-role-1/user-2/1-cv.pdf" });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("message");
		});

		it("returns 500 when service fails", async () => {
			mockApplyForRole.mockRejectedValue(new Error("boom"));

			const response = await request(app)
				.post("/job-roles/1/applications")
				.send({ userId: 2, cvKey: "cvs/job-role-1/user-2/1-cv.pdf" });

			expect(response.status).toBe(500);
			expect(response.body).toEqual({ message: "Internal server error" });
		});
	});
});
