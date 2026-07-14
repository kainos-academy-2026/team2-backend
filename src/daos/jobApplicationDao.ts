import type { JobApplication as PrismaJobApplication } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { JobApplication } from "../models/jobApplication.js";

export class JobApplicationDao {
	async create(input: {
		jobRoleId: number;
		userId: number;
		cvUrl: string;
		status: string;
	}): Promise<JobApplication> {
		const result: PrismaJobApplication = await prisma.jobApplication.create({
			data: input,
		});

		return {
			applicationId: result.applicationId,
			jobRoleId: result.jobRoleId,
			userId: result.userId,
			cvUrl: result.cvUrl,
			status: result.status,
			createdAt: result.createdAt,
		};
	}
}
