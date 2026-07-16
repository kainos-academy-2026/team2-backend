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
