import type { JobApplication as PrismaJobApplication } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { JobApplicationMapper } from "../mappers/jobApplicationMapper.js";
import type { JobApplication } from "../models/jobApplication.js";

export class JobApplicationDao {
	constructor(private readonly jobApplicationMapper: JobApplicationMapper) {}

	async create(input: {
		jobRoleId: number;
		userId: number;
		cvUrl: string;
		status: string;
	}): Promise<JobApplication> {
		const result: PrismaJobApplication = await prisma.jobApplication.create({
			data: input,
		});

		return this.jobApplicationMapper.toModel(result);
	}
}
