import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ApplicationAlreadyExistsError,
	JobRoleNotOpenForApplicationsError,
} from "../../src/errors/jobApplicationErrors.js";
import { UserNotFoundError } from "../../src/errors/userErrors.js";
import { JobApplicationMapper } from "../../src/mappers/jobApplicationMapper.js";
import { JobApplicationService } from "../../src/services/jobApplicationService.js";
import { makeJobRole } from "../fixtures/jobRoleFixtures.js";

const fakeFile = {
	originalname: "cv.pdf",
	mimetype: "application/pdf",
	buffer: Buffer.from("dummy"),
} as Express.Multer.File;

describe("JobApplicationService.applyForRole", () => {
	const mockFindJobRoleById = vi.fn();
	const mockFindUserById = vi.fn();
	const mockCreateApplication = vi.fn();
	const mockUploadCv = vi.fn();

	let service: JobApplicationService;

	beforeEach(() => {
		vi.resetAllMocks();
		service = new JobApplicationService(
			{ findJobRoleById: mockFindJobRoleById } as never,
			{ findUserById: mockFindUserById } as never,
			{ create: mockCreateApplication } as never,
			{ uploadCv: mockUploadCv } as never,
			new JobApplicationMapper(),
		);
	});

	it("creates an in-progress application when role is open and has positions", async () => {
		mockFindJobRoleById.mockResolvedValue(
			makeJobRole({ jobRoleId: 2, status: "OPEN", numberOfOpenPositions: 2 }),
		);
		mockFindUserById.mockResolvedValue({ id: 11 });
		mockUploadCv.mockResolvedValue(
			"https://bucket.s3.eu-west-1.amazonaws.com/cv.pdf",
		);
		mockCreateApplication.mockResolvedValue({
			applicationId: 5,
			jobRoleId: 2,
			userId: 11,
			cvUrl: "https://bucket.s3.eu-west-1.amazonaws.com/cv.pdf",
			status: "IN_PROGRESS",
			createdAt: new Date("2026-07-14T12:00:00.000Z"),
		});

		const result = await service.applyForRole({
			jobRoleId: "2",
			userId: 11,
			file: fakeFile,
		});

		expect(mockFindJobRoleById).toHaveBeenCalledWith("2");
		expect(mockFindUserById).toHaveBeenCalledWith(11);
		expect(mockUploadCv).toHaveBeenCalled();
		expect(mockCreateApplication).toHaveBeenCalledWith(
			expect.objectContaining({
				jobRoleId: 2,
				userId: 11,
				status: "IN_PROGRESS",
			}),
		);
		expect(result.status).toBe("IN_PROGRESS");
	});

	it("throws when job role does not exist", async () => {
		mockFindJobRoleById.mockResolvedValue(null);

		await expect(
			service.applyForRole({ jobRoleId: "999", userId: 11, file: fakeFile }),
		).rejects.toThrow("Job role not found");
	});

	it("throws when role is closed or has no open positions", async () => {
		mockFindJobRoleById.mockResolvedValue(
			makeJobRole({ status: "CLOSED", numberOfOpenPositions: 1 }),
		);

		await expect(
			service.applyForRole({ jobRoleId: "2", userId: 11, file: fakeFile }),
		).rejects.toBeInstanceOf(JobRoleNotOpenForApplicationsError);
	});

	it("throws when user does not exist", async () => {
		mockFindJobRoleById.mockResolvedValue(
			makeJobRole({ status: "OPEN", numberOfOpenPositions: 1 }),
		);
		mockFindUserById.mockResolvedValue(null);

		await expect(
			service.applyForRole({ jobRoleId: "2", userId: 11, file: fakeFile }),
		).rejects.toBeInstanceOf(UserNotFoundError);
	});

	it("maps prisma unique constraint to ApplicationAlreadyExistsError", async () => {
		mockFindJobRoleById.mockResolvedValue(
			makeJobRole({ jobRoleId: 2, status: "OPEN", numberOfOpenPositions: 1 }),
		);
		mockFindUserById.mockResolvedValue({ id: 11 });
		mockUploadCv.mockResolvedValue(
			"https://bucket.s3.eu-west-1.amazonaws.com/cv.pdf",
		);
		mockCreateApplication.mockRejectedValue(
			new Prisma.PrismaClientKnownRequestError("duplicate", {
				code: "P2002",
				clientVersion: "7.8.0",
			}),
		);

		await expect(
			service.applyForRole({ jobRoleId: "2", userId: 11, file: fakeFile }),
		).rejects.toBeInstanceOf(ApplicationAlreadyExistsError);
	});
});
