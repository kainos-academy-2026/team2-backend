import type { JobApplicationResponseDto } from "../dtos/jobApplicationResponseDto.js";
import type { JobApplication } from "../models/jobApplication.js";

export class JobApplicationMapper {
	toResponse(jobApplication: JobApplication): JobApplicationResponseDto {
		return {
			applicationId: jobApplication.applicationId,
			jobRoleId: jobApplication.jobRoleId,
			userId: jobApplication.userId,
			cvUrl: jobApplication.cvUrl,
			status: jobApplication.status,
			createdAt: jobApplication.createdAt.toISOString(),
		};
	}
}
