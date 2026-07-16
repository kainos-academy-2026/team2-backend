import { Prisma } from "@prisma/client";
import type { JobApplicationDao } from "../daos/jobApplicationDao.js";
import type { JobRoleDao } from "../daos/jobRoleDao.js";
import type { UserDao } from "../daos/userDao.js";
import type { JobApplicationResponseDto } from "../dtos/jobApplicationResponseDto.js";
import {
	ApplicationAlreadyExistsError,
	JobRoleNotFoundError,
	JobRoleNotOpenForApplicationsError,
} from "../errors/jobApplicationErrors.js";
import { UserNotFoundError } from "../errors/userErrors.js";
import type CvStorage from "../interfaces/cvStorage.js";
import type { JobApplicationMapper } from "../mappers/jobApplicationMapper.js";

export class JobApplicationService {
	constructor(
		private readonly jobRoleDao: JobRoleDao,
		private readonly userDao: UserDao,
		private readonly jobApplicationDao: JobApplicationDao,
		private readonly cvStorage: CvStorage,
		private readonly jobApplicationMapper: JobApplicationMapper,
	) {}

	async createCvUploadUrl(input: {
		jobRoleId: string;
		userId: number;
		fileName: string;
		contentType: "application/pdf";
	}): Promise<{ cvKey: string; uploadUrl: string }> {
		const jobRole = await this.getOpenJobRole(input.jobRoleId);
		await this.ensureUserExists(input.userId);

		const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
		const cvKey = `cvs/job-role-${jobRole.jobRoleId}/user-${input.userId}/${Date.now()}-${safeFileName}`;

		return this.cvStorage.createCvUploadUrl({
			key: cvKey,
			contentType: input.contentType,
		});
	}

	async applyForRole(input: {
		jobRoleId: string;
		userId: number;
		cvKey: string;
	}): Promise<JobApplicationResponseDto> {
		const jobRole = await this.getOpenJobRole(input.jobRoleId);
		await this.ensureUserExists(input.userId);
		const cvUrl = this.cvStorage.getCvUrl(input.cvKey);

		try {
			const application = await this.jobApplicationDao.create({
				jobRoleId: jobRole.jobRoleId,
				userId: input.userId,
				cvUrl,
				status: "IN_PROGRESS",
			});

			return this.jobApplicationMapper.toResponse(application);
		} catch (error: unknown) {
			if (this.isDuplicateApplicationError(error)) {
				throw new ApplicationAlreadyExistsError();
			}

			throw error;
		}
	}

	private isDuplicateApplicationError(error: unknown): boolean {
		if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
			return false;
		}

		if (error.code !== "P2002") {
			return false;
		}

		const target = error.meta?.target;
		if (!Array.isArray(target)) {
			return true;
		}

		const targetFields = target.map((value) => String(value));
		return (
			targetFields.includes("jobRoleId") && targetFields.includes("userId")
		);
	}

	private async getOpenJobRole(
		jobRoleId: string,
	): Promise<{ jobRoleId: number }> {
		const jobRole = await this.jobRoleDao.findJobRoleById(jobRoleId);
		if (!jobRole) {
			throw new JobRoleNotFoundError();
		}

		if (jobRole.status !== "OPEN" || jobRole.numberOfOpenPositions <= 0) {
			throw new JobRoleNotOpenForApplicationsError();
		}

		return { jobRoleId: jobRole.jobRoleId };
	}

	private async ensureUserExists(userId: number): Promise<void> {
		const user = await this.userDao.findUserById(userId);
		if (!user) {
			throw new UserNotFoundError();
		}
	}
}
