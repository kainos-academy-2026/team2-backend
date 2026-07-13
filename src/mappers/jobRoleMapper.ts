import type { JobRoleResponseDto } from "../dtos/jobRoleResponseDto.js";
import type { JobRole } from "../models/jobRole.js";

export class JobRoleMapper {
	toResponse(jobRole: JobRole): JobRoleResponseDto {
		return {
			jobRoleId: jobRole.jobRoleId,
			roleName: jobRole.roleName,
			location: jobRole.location,
			capability: jobRole.capability.capabilityName,
			band: jobRole.band.bandName,
			closingDate: jobRole.closingDate.toISOString(),
			status: jobRole.status,
			description: jobRole.description,
			responsibilities: jobRole.responsibilities,
			sharepointUrl: jobRole.sharepointUrl,
			numberOfOpenPositions: jobRole.numberOfOpenPositions,
		};
	}
}
