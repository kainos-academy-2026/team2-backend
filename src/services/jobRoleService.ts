import type { JobRoleDao } from "../daos/jobRoleDao.js";
import type { JobRoleResponseDto } from "../dtos/jobRoleResponseDto.js";
import {
	JobRoleHasApplicationsError,
	JobRoleNotFoundError,
} from "../errors/jobApplicationErrors.js";
import type { JobRoleMapper } from "../mappers/jobRoleMapper.js";

export class JobRoleService {
	constructor(
		private readonly jobRoleDao: JobRoleDao,
		private readonly jobRoleMapper: JobRoleMapper,
	) {}

	async findAllOpen(): Promise<JobRoleResponseDto[]> {
		const jobRoles = await this.jobRoleDao.findOpenJobRoles();

		return jobRoles.map((jobRole) => this.jobRoleMapper.toResponse(jobRole));
	}

	async findById(jobRoleId: string): Promise<JobRoleResponseDto | null> {
		const jobRole = await this.jobRoleDao.findJobRoleById(jobRoleId);

		if (!jobRole) {
			return null;
		}

		return this.jobRoleMapper.toResponse(jobRole);
	}

	async deleteRole(jobRoleId: string): Promise<void> {
		const jobRole = await this.jobRoleDao.findJobRoleById(jobRoleId);

		if (!jobRole) {
			throw new JobRoleNotFoundError();
		}

		const hasApplications = await this.jobRoleDao.hasApplications(
			jobRole.jobRoleId,
		);

		if (hasApplications) {
			throw new JobRoleHasApplicationsError();
		}

		await this.jobRoleDao.deleteJobRole(jobRole.jobRoleId);
	}
}
