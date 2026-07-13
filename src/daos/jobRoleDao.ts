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
}
