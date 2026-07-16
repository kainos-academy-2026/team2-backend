import type { CreateJobRoleInput } from "../interfaces/createJobRoleInput.js";
import { prisma } from "../lib/prisma.js";
import type { JobRole } from "../models/jobRole.js";

export class JobRoleDao {
	async findOpenJobRoles(): Promise<JobRole[]> {
		return prisma.jobRole.findMany({
			where: {
				status: "OPEN",
			},
			include: {
				capability: true,
				band: true,
			},
			orderBy: {
				closingDate: "asc",
			},
		});
	}

	async findJobRoleById(jobRoleId: string): Promise<JobRole | null> {
		return prisma.jobRole.findUnique({
			where: {
				jobRoleId: Number(jobRoleId),
			},
			include: {
				capability: true,
				band: true,
			},
		});
	}

	async findBands(): Promise<{ nameId: number; bandName: string }[]> {
		return prisma.band.findMany({
			select: { nameId: true, bandName: true },
		});
	}

	async findCapabilities(): Promise<
		{ capabilityId: number; capabilityName: string }[]
	> {
		return prisma.capability.findMany({
			select: { capabilityId: true, capabilityName: true },
		});
	}

	async createJobRole(input: CreateJobRoleInput): Promise<JobRole> {
		return prisma.jobRole.create({
			data: {
				roleName: input.roleName,
				location: input.location,
				capabilityId: input.capabilityId,
				bandId: input.bandId,
				closingDate: input.closingDate,
				status: "OPEN",
				description: input.description,
				sharepointUrl: input.sharepointUrl,
				responsibilities: input.responsibilities,
				numberOfOpenPositions: input.numberOfOpenPositions,
			},
		});
	}

	async hasApplications(jobRoleId: number): Promise<boolean> {
		const count = await prisma.jobApplication.count({
			where: { jobRoleId },
		});
		return count > 0;
	}

	async deleteJobRole(jobRoleId: number): Promise<void> {
		await prisma.jobRole.delete({
			where: { jobRoleId },
		});
	}
}
