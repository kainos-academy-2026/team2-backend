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

describe("JobApplicationService", () => {
	const mockFindJobRoleById = vi.fn();
	const mockFindUserById = vi.fn();
	const mockCreateApplication = vi.fn();
	const mockCreateCvUploadUrl = vi.fn();
	const mockGetCvUrl = vi.fn();

	let service: JobApplicationService;

	beforeEach(() => {
		vi.resetAllMocks();
		service = new JobApplicationService(
			{ findJobRoleById: mockFindJobRoleById } as never,
			{ findUserById: mockFindUserById } as never,
			{ create: mockCreateApplication } as never,
			{
				createCvUploadUrl: mockCreateCvUploadUrl,
				getCvUrl: mockGetCvUrl,
			} as never,
			new JobApplicationMapper(),
		);
	});

	describe("createCvUploadUrl", () => {
		it("returns a presigned upload URL when role is open and user exists", async () => {
			mockFindJobRoleById.mockResolvedValue(
				makeJobRole({ jobRoleId: 2, status: "OPEN", numberOfOpenPositions: 2 }),
			);
			mockFindUserById.mockResolvedValue({ id: 11 });
			mockCreateCvUploadUrl.mockResolvedValue({
				cvKey: "cvs/job-role-2/user-11/1-cv.pdf",
				uploadUrl: "https://signed.example.com/upload",
			});

			const result = await service.createCvUploadUrl({
				jobRoleId: "2",
				userId: 11,
				fileName: "cv.pdf",
				contentType: "application/pdf",
			});

			expect(mockFindJobRoleById).toHaveBeenCalledWith("2");
			expect(mockFindUserById).toHaveBeenCalledWith(11);
			expect(mockCreateCvUploadUrl).toHaveBeenCalledWith(
				expect.objectContaining({
					contentType: "application/pdf",
				}),
			);
			expect(result).toEqual({
				cvKey: "cvs/job-role-2/user-11/1-cv.pdf",
				uploadUrl: "https://signed.example.com/upload",
			});
		});

		it("throws when role is closed", async () => {
			mockFindJobRoleById.mockResolvedValue(
				makeJobRole({ status: "CLOSED", numberOfOpenPositions: 1 }),
			);

			await expect(
				service.createCvUploadUrl({
					jobRoleId: "2",
					userId: 11,
					fileName: "cv.pdf",
					contentType: "application/pdf",
				}),
			).rejects.toBeInstanceOf(JobRoleNotOpenForApplicationsError);
		});
	});

	describe("applyForRole", () => {
		it("creates an in-progress application when role is open and has positions", async () => {
			mockFindJobRoleById.mockResolvedValue(
				makeJobRole({ jobRoleId: 2, status: "OPEN", numberOfOpenPositions: 2 }),
			);
			mockFindUserById.mockResolvedValue({ id: 11 });
			mockGetCvUrl.mockReturnValue(
				"https://bucket.s3.eu-west-1.amazonaws.com/cvs/job-role-2/user-11/1-cv.pdf",
			);
			mockCreateApplication.mockResolvedValue({
				applicationId: 5,
				jobRoleId: 2,
				userId: 11,
				cvUrl:
					"https://bucket.s3.eu-west-1.amazonaws.com/cvs/job-role-2/user-11/1-cv.pdf",
				status: "IN_PROGRESS",
				createdAt: new Date("2026-07-14T12:00:00.000Z"),
			});

			const result = await service.applyForRole({
				jobRoleId: "2",
				userId: 11,
				cvKey: "cvs/job-role-2/user-11/1-cv.pdf",
			});

			expect(mockGetCvUrl).toHaveBeenCalledWith(
				"cvs/job-role-2/user-11/1-cv.pdf",
			);
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
				service.applyForRole({
					jobRoleId: "999",
					userId: 11,
					cvKey: "cvs/job-role-999/user-11/1-cv.pdf",
				}),
			).rejects.toThrow("Job role not found");
		});

		it("throws when role is closed or has no open positions", async () => {
			mockFindJobRoleById.mockResolvedValue(
				makeJobRole({ status: "CLOSED", numberOfOpenPositions: 1 }),
			);

			await expect(
				service.applyForRole({
					jobRoleId: "2",
					userId: 11,
					cvKey: "cvs/job-role-2/user-11/1-cv.pdf",
				}),
			).rejects.toBeInstanceOf(JobRoleNotOpenForApplicationsError);
		});

		it("throws when user does not exist", async () => {
			mockFindJobRoleById.mockResolvedValue(
				makeJobRole({ status: "OPEN", numberOfOpenPositions: 1 }),
			);
			mockFindUserById.mockResolvedValue(null);

			await expect(
				service.applyForRole({
					jobRoleId: "2",
					userId: 11,
					cvKey: "cvs/job-role-2/user-11/1-cv.pdf",
				}),
			).rejects.toBeInstanceOf(UserNotFoundError);
		});

		it("maps prisma unique constraint to ApplicationAlreadyExistsError", async () => {
			mockFindJobRoleById.mockResolvedValue(
				makeJobRole({
					jobRoleId: 2,
					status: "OPEN",
					numberOfOpenPositions: 1,
				}),
			);
			mockFindUserById.mockResolvedValue({ id: 11 });
			mockGetCvUrl.mockReturnValue(
				"https://bucket.s3.eu-west-1.amazonaws.com/cvs/job-role-2/user-11/1-cv.pdf",
			);
			mockCreateApplication.mockRejectedValue(
				new Prisma.PrismaClientKnownRequestError("duplicate", {
					code: "P2002",
					clientVersion: "7.8.0",
				}),
			);

			await expect(
				service.applyForRole({
					jobRoleId: "2",
					userId: 11,
					cvKey: "cvs/job-role-2/user-11/1-cv.pdf",
				}),
			).rejects.toBeInstanceOf(ApplicationAlreadyExistsError);
		});
	});
});
