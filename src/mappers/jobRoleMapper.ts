import type { JobRole } from "../models/jobRole.js";
import type { JobRoleResponseDto } from "../dtos/jobRoleResponseDto.js";

export class JobRoleMapper {
  static toResponse(jobRole: JobRole): JobRoleResponseDto {
    return {
      roleName: jobRole.roleName,
      location: jobRole.location,
      capability: jobRole.capability.capabilityName,
      band: jobRole.band.bandName,
      closingDate: jobRole.closingDate,
    };
  }
}