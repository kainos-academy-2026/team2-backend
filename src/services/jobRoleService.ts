import type { JobRoleDao } from "../daos/jobRoleDao.js";
import type { CreateJobRoleRequestDto } from "../dtos/createJobRoleRequestDto.js";
import type { JobRoleResponseDto } from "../dtos/jobRoleResponseDto.js";
import type {
	BandReferenceDto,
	CapabilityReferenceDto,
} from "../dtos/referenceDataResponseDto.js";
import { InvalidReferenceDataError } from "../errors/jobRoleErrors.js";
import type { JobRoleMapper } from "../mappers/jobRoleMapper.js";

const isForeignKeyConstraintError = (error: unknown): boolean => {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	return (
		"code" in error && typeof error.code === "string" && error.code === "P2003"
	);
};

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

	async getBands(): Promise<BandReferenceDto[]> {
		const bands = await this.jobRoleDao.findBands();

		return bands.map((band) => ({
			id: band.nameId,
			name: band.bandName,
		}));
	}

	async getCapabilities(): Promise<CapabilityReferenceDto[]> {
		const capabilities = await this.jobRoleDao.findCapabilities();

		return capabilities.map((capability) => ({
			id: capability.capabilityId,
			name: capability.capabilityName,
		}));
	}

	async createJobRole(
		dto: CreateJobRoleRequestDto,
	): Promise<JobRoleResponseDto> {
		try {
			const input = this.jobRoleMapper.toCreateInput(dto);
			const created = await this.jobRoleDao.createJobRole(input);
			const [capabilities, bands] = await Promise.all([
				this.jobRoleDao.findCapabilities(),
				this.jobRoleDao.findBands(),
			]);
			const capabilityName = capabilities.find(
				(capability) => capability.capabilityId === created.capabilityId,
			)?.capabilityName;
			const bandName = bands.find(
				(band) => band.nameId === created.bandId,
			)?.bandName;

			if (!capabilityName || !bandName) {
				throw new InvalidReferenceDataError();
			}

			return this.jobRoleMapper.toResponse(created, capabilityName, bandName);
		} catch (error: unknown) {
			if (isForeignKeyConstraintError(error)) {
				throw new InvalidReferenceDataError();
			}

			throw error;
		}
	}
}
