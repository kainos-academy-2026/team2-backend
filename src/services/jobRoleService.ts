import type { JobRoleDao } from "../daos/jobRoleDao.js";
import type { CreateJobRoleRequestDto } from "../dtos/createJobRoleRequestDto.js";
import type { JobRoleResponseDto } from "../dtos/jobRoleResponseDto.js";
import {
	BandNotFoundError,
	CapabilityNotFoundError,
} from "../errors/jobRoleErrors.js";
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

	async getBands(): Promise<string[]> {
		const bands = await this.jobRoleDao.findBands();

		return bands.map((band) => band.bandName);
	}

	async getCapabilities(): Promise<string[]> {
		const capabilities = await this.jobRoleDao.findCapabilities();

		return capabilities.map((capability) => capability.capabilityName);
	}

	async createJobRole(
		dto: CreateJobRoleRequestDto,
	): Promise<JobRoleResponseDto> {
		const band = await this.jobRoleDao.findBandByName(dto.band);
		if (!band) {
			throw new BandNotFoundError();
		}

		const capability = await this.jobRoleDao.findCapabilityByName(
			dto.capability,
		);
		if (!capability) {
			throw new CapabilityNotFoundError();
		}

		const created = await this.jobRoleDao.createJobRole({
			roleName: dto.name,
			location: dto.location,
			capabilityId: capability.capabilityId,
			bandId: band.nameId,
			closingDate: new Date(dto.closingDate),
			description: dto.description ?? "",
			sharepointUrl: dto.sharepointUrl ?? "",
			responsibilities: dto.responsibilities ?? [],
			numberOfOpenPositions: dto.numberOfOpenPositions ?? 0,
		});

		return this.jobRoleMapper.toResponse(created);
	}
}
