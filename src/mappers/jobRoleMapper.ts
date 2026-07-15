import type { CreateJobRoleRequestDto } from "../dtos/createJobRoleRequestDto.js";
import type { JobRoleResponseDto } from "../dtos/jobRoleResponseDto.js";
import type { CreateJobRoleInput } from "../interfaces/createJobRoleInput.js";
import type { JobRole } from "../models/jobRole.js";

export class JobRoleMapper {
	toCreateInput(dto: CreateJobRoleRequestDto): CreateJobRoleInput {
		return {
			roleName: dto.name,
			location: dto.location,
			capabilityId: dto.capabilityId,
			bandId: dto.bandId,
			closingDate: new Date(dto.closingDate),
			description: dto.description ?? "",
			sharepointUrl: dto.sharepointUrl ?? "",
			responsibilities: dto.responsibilities ?? [],
			numberOfOpenPositions: dto.numberOfOpenPositions ?? 0,
		};
	}

	toResponse(
		jobRole: JobRole,
		capabilityName?: string,
		bandName?: string,
	): JobRoleResponseDto {
		const resolvedCapabilityName =
			capabilityName ?? jobRole.capability?.capabilityName;
		const resolvedBandName = bandName ?? jobRole.band?.bandName;

		if (!resolvedCapabilityName || !resolvedBandName) {
			throw new Error("Capability and band names are required");
		}

		return {
			jobRoleId: jobRole.jobRoleId,
			roleName: jobRole.roleName,
			location: jobRole.location,
			capability: resolvedCapabilityName,
			band: resolvedBandName,
			closingDate: jobRole.closingDate.toISOString(),
			status: jobRole.status,
			description: jobRole.description,
			responsibilities: jobRole.responsibilities,
			sharepointUrl: jobRole.sharepointUrl,
			numberOfOpenPositions: jobRole.numberOfOpenPositions,
		};
	}
}
