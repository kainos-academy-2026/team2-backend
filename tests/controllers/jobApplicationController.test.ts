import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobApplicationController } from "../../src/controllers/jobApplicationController.js";
import {
	ApplicationAlreadyExistsError,
	JobRoleNotOpenForApplicationsError,
} from "../../src/errors/jobApplicationErrors.js";
import { UserNotFoundError } from "../../src/errors/userErrors.js";
import type { JobApplicationService } from "../../src/services/jobApplicationService.js";

describe("JobApplicationController.applyForRole", () => {
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
			applyForRole: mockApplyForRole,
		} as unknown as JobApplicationService;

		controller = new JobApplicationController(mockService);
		req = {
			params: { id: "3" },
			body: { userId: 6 },
			file: {
				originalname: "cv.pdf",
				mimetype: "application/pdf",
				buffer: Buffer.from("cv"),
			} as Express.Multer.File,
		} as unknown as Request;
		res = {
			status: mockStatus,
		} as unknown as Response;
	});

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
			file: req.file,
		});
		expect(mockStatus).toHaveBeenCalledWith(201);
	});

	it("returns 400 when job role id is missing", async () => {
		req = { ...req, params: {} } as Request;

		await controller.applyForRole(req, res);

		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockJson).toHaveBeenCalledWith({
			message: "Job role ID is required",
		});
	});

	it("returns 400 when cv file is missing", async () => {
		req = { ...req, file: undefined } as unknown as Request;

		await controller.applyForRole(req, res);

		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockJson).toHaveBeenCalledWith({ message: "CV file is required" });
	});

	it("returns 404 when user is not found", async () => {
		mockApplyForRole.mockRejectedValue(new UserNotFoundError());

		await controller.applyForRole(req, res);

		expect(mockStatus).toHaveBeenCalledWith(404);
	});

	it("returns 404 when job role is not found", async () => {
		mockApplyForRole.mockRejectedValue(new Error("Job role not found"));

		await controller.applyForRole(req, res);

		expect(mockStatus).toHaveBeenCalledWith(404);
	});

	it("returns 409 when job role is not open", async () => {
		mockApplyForRole.mockRejectedValue(
			new JobRoleNotOpenForApplicationsError(),
		);

		await controller.applyForRole(req, res);

		expect(mockStatus).toHaveBeenCalledWith(409);
	});

	it("returns 409 when application already exists", async () => {
		mockApplyForRole.mockRejectedValue(new ApplicationAlreadyExistsError());

		await controller.applyForRole(req, res);

		expect(mockStatus).toHaveBeenCalledWith(409);
	});

	it("returns 500 on unexpected errors", async () => {
		mockApplyForRole.mockRejectedValue(new Error("boom"));

		await controller.applyForRole(req, res);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});
