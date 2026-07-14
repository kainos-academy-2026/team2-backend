import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobApplicationDao } from "../../src/daos/jobApplicationDao.js";
import { JobApplicationMapper } from "../../src/mappers/jobApplicationMapper.js";

vi.mock("../../src/lib/prisma.js", () => ({
	prisma: {
		jobApplication: {
			create: vi.fn(),
		},
	},
}));

import { prisma } from "../../src/lib/prisma.js";

describe("JobApplicationDao.create", () => {
	let dao: JobApplicationDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new JobApplicationDao(new JobApplicationMapper());
	});

	it("creates and returns a job application", async () => {
		const createdAt = new Date("2026-07-14T12:00:00.000Z");
		vi.mocked(prisma.jobApplication.create).mockResolvedValue({
			applicationId: 1,
			jobRoleId: 3,
			userId: 9,
			cvUrl: "https://bucket.s3.eu-west-1.amazonaws.com/file.pdf",
			status: "IN_PROGRESS",
			createdAt,
		} as never);

		const result = await dao.create({
			jobRoleId: 3,
			userId: 9,
			cvUrl: "https://bucket.s3.eu-west-1.amazonaws.com/file.pdf",
			status: "IN_PROGRESS",
		});

		expect(vi.mocked(prisma.jobApplication.create)).toHaveBeenCalledWith({
			data: {
				jobRoleId: 3,
				userId: 9,
				cvUrl: "https://bucket.s3.eu-west-1.amazonaws.com/file.pdf",
				status: "IN_PROGRESS",
			},
		});
		expect(result).toEqual({
			applicationId: 1,
			jobRoleId: 3,
			userId: 9,
			cvUrl: "https://bucket.s3.eu-west-1.amazonaws.com/file.pdf",
			status: "IN_PROGRESS",
			createdAt,
		});
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.jobApplication.create).mockRejectedValue(
			new Error("db down"),
		);

		await expect(
			dao.create({
				jobRoleId: 3,
				userId: 9,
				cvUrl: "https://bucket.s3.eu-west-1.amazonaws.com/file.pdf",
				status: "IN_PROGRESS",
			}),
		).rejects.toThrow("db down");
	});
});
