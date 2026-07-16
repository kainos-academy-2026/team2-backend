import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobApplicationController } from "../../src/controllers/jobApplicationController.js";
import {
	ApplicationAlreadyExistsError,
	JobRoleNotFoundError,
	JobRoleNotOpenForApplicationsError,
} from "../../src/errors/jobApplicationErrors.js";
import { UserNotFoundError } from "../../src/errors/userErrors.js";
import type { JobApplicationService } from "../../src/services/jobApplicationService.js";

describe("JobApplicationController", () => {
	const mockCreateCvUploadUrl = vi.fn();
	const mockApplyForRole = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();

	let controller: JobApplicationController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const mockService = {
			createCvUploadUrl: mockCreateCvUploadUrl,
			applyForRole: mockApplyForRole,
		} as unknown as JobApplicationService;

		controller = new JobApplicationController(mockService);
		req = {
			params: { id: "3" },
			body: {
				userId: 6,
				fileName: "cv.pdf",
				contentType: "application/pdf",
				cvKey: "cvs/job-role-3/user-6/1-cv.pdf",
			},
		} as unknown as Request;
		res = {
			status: mockStatus,
		} as unknown as Response;
	});

	describe("createCvUploadUrl", () => {
		it("returns 200 when upload URL is created", async () => {
			mockCreateCvUploadUrl.mockResolvedValue({
				cvKey: "cvs/job-role-3/user-6/1-cv.pdf",
				uploadUrl: "https://signed.example.com/upload",
			});

			await controller.createCvUploadUrl(req, res);

			expect(mockCreateCvUploadUrl).toHaveBeenCalledWith({
				jobRoleId: "3",
				userId: 6,
				fileName: "cv.pdf",
				contentType: "application/pdf",
			});
			expect(mockStatus).toHaveBeenCalledWith(200);
		});

		it("returns 404 when user is not found", async () => {
			mockCreateCvUploadUrl.mockRejectedValue(new UserNotFoundError());

			await controller.createCvUploadUrl(req, res);

			expect(mockStatus).toHaveBeenCalledWith(404);
		});

		it("returns 422 when job role is not open", async () => {
			mockCreateCvUploadUrl.mockRejectedValue(
				new JobRoleNotOpenForApplicationsError(),
			);

			await controller.createCvUploadUrl(req, res);

			expect(mockStatus).toHaveBeenCalledWith(422);
		});
	});

	describe("applyForRole", () => {
		it("returns 201 when application is created", async () => {
			mockApplyForRole.mockResolvedValue({
				applicationId: 7,
				jobRoleId: 3,
				userId: 6,
				cvUrl: "https://bucket.s3.eu-west-1.amazonaws.com/cv.pdf",
				status: "IN_PROGRESS",
				createdAt: "2026-07-14T12:00:00.000Z",
			});

			await controller.applyForRole(req, res);

			expect(mockApplyForRole).toHaveBeenCalledWith({
				jobRoleId: "3",
				userId: 6,
				cvKey: "cvs/job-role-3/user-6/1-cv.pdf",
			});
			expect(mockStatus).toHaveBeenCalledWith(201);
		});

		it("returns 404 when job role is not found", async () => {
			mockApplyForRole.mockRejectedValue(new JobRoleNotFoundError());

			await controller.applyForRole(req, res);

			expect(mockStatus).toHaveBeenCalledWith(404);
		});

		it("returns 409 when application already exists", async () => {
			mockApplyForRole.mockRejectedValue(new ApplicationAlreadyExistsError());

			await controller.applyForRole(req, res);

			expect(mockStatus).toHaveBeenCalledWith(409);
		});

		it("returns 422 when job role is not open", async () => {
			mockApplyForRole.mockRejectedValue(
				new JobRoleNotOpenForApplicationsError(),
			);

			await controller.applyForRole(req, res);

			expect(mockStatus).toHaveBeenCalledWith(422);
		});

		it("returns 500 on unexpected errors", async () => {
			mockApplyForRole.mockRejectedValue(new Error("boom"));

			await controller.applyForRole(req, res);

			expect(mockStatus).toHaveBeenCalledWith(500);
			expect(mockJson).toHaveBeenCalledWith({
				message: "Internal server error",
			});
		});
	});
});
