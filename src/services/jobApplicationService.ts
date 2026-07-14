import { Prisma } from "@prisma/client";
import type { JobApplicationDao } from "../daos/jobApplicationDao.js";
import type { JobRoleDao } from "../daos/jobRoleDao.js";
import type { UserDao } from "../daos/userDao.js";
import type { JobApplicationResponseDto } from "../dtos/jobApplicationResponseDto.js";
import {
	ApplicationAlreadyExistsError,
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

	async applyForRole(input: {
		jobRoleId: string;
		userId: number;
		file: Express.Multer.File;
	}): Promise<JobApplicationResponseDto> {
		const jobRole = await this.jobRoleDao.findJobRoleById(input.jobRoleId);
		if (!jobRole) {
			throw new Error("Job role not found");
		}

		if (jobRole.status !== "OPEN" || jobRole.numberOfOpenPositions <= 0) {
			throw new JobRoleNotOpenForApplicationsError();
		}

		const user = await this.userDao.findUserById(input.userId);
		if (!user) {
			throw new UserNotFoundError();
		}

		const storageKey = `cvs/job-role-${jobRole.jobRoleId}/user-${input.userId}/${Date.now()}-${input.file.originalname}`;
		const cvUrl = await this.cvStorage.uploadCv({
			key: storageKey,
			content: input.file.buffer,
			contentType: input.file.mimetype,
		});

		try {
			const application = await this.jobApplicationDao.create({
				jobRoleId: jobRole.jobRoleId,
				userId: input.userId,
				cvUrl,
				status: "IN_PROGRESS",
			});

			return this.jobApplicationMapper.toResponse(application);
		} catch (error: unknown) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				throw new ApplicationAlreadyExistsError();
			}

			throw error;
		}
	}
}
