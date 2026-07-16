import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleDao } from "../../src/daos/jobRoleDao.js";
import { makeJobRole } from "../fixtures/jobRoleFixtures.js";

vi.mock("../../src/lib/prisma.js", () => ({
	prisma: {
		jobRole: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			delete: vi.fn(),
		},
		jobApplication: {
			count: vi.fn(),
		},
	},
}));

import { prisma } from "../../src/lib/prisma.js";

describe("JobRoleDao.findOpenJobRoles", () => {
	let dao: JobRoleDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new JobRoleDao();
	});

	it("returns all open job roles ordered by closing date", async () => {
		const role1 = makeJobRole({ jobRoleId: 1, capabilityId: 1, bandId: 1 });
		const role2 = makeJobRole({ jobRoleId: 2, capabilityId: 1, bandId: 2 });
		vi.mocked(prisma.jobRole.findMany).mockResolvedValue([role1, role2]);

		const result = await dao.findOpenJobRoles();

		expect(vi.mocked(prisma.jobRole.findMany)).toHaveBeenCalledWith({
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
		expect(result).toEqual([role1, role2]);
	});

	it("returns an empty array when no open roles exist", async () => {
		vi.mocked(prisma.jobRole.findMany).mockResolvedValue([]);

		const result = await dao.findOpenJobRoles();

		expect(result).toEqual([]);
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.jobRole.findMany).mockRejectedValue(
			new Error("db connection failed"),
		);

		await expect(dao.findOpenJobRoles()).rejects.toThrow(
			"db connection failed",
		);
	});
});

describe("JobRoleDao.findJobRoleById", () => {
	let dao: JobRoleDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new JobRoleDao();
	});

	it("returns a job role by ID with includes", async () => {
		const role = makeJobRole({ jobRoleId: 5, capabilityId: 1, bandId: 1 });
		vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(role);

		const result = await dao.findJobRoleById("5");

		expect(vi.mocked(prisma.jobRole.findUnique)).toHaveBeenCalledWith({
			where: {
				jobRoleId: 5,
			},
			include: {
				capability: true,
				band: true,
			},
		});
		expect(result).toEqual(role);
	});

	it("returns null when job role does not exist", async () => {
		vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(null);

		const result = await dao.findJobRoleById("999");

		expect(result).toBeNull();
	});

	it("converts string ID to number", async () => {
		const role = makeJobRole({ jobRoleId: 42, capabilityId: 1, bandId: 1 });
		vi.mocked(prisma.jobRole.findUnique).mockResolvedValue(role);

		await dao.findJobRoleById("42");

		expect(vi.mocked(prisma.jobRole.findUnique)).toHaveBeenCalledWith({
			where: {
				jobRoleId: 42,
			},
			include: {
				capability: true,
				band: true,
			},
		});
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.jobRole.findUnique).mockRejectedValue(
			new Error("db timeout"),
		);

		await expect(dao.findJobRoleById("5")).rejects.toThrow("db timeout");
	});
});

describe("JobRoleDao.hasApplications", () => {
	let dao: JobRoleDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new JobRoleDao();
	});

	it("returns true when job role has applications", async () => {
		vi.mocked(prisma.jobApplication.count).mockResolvedValue(2);

		const result = await dao.hasApplications(1);

		expect(vi.mocked(prisma.jobApplication.count)).toHaveBeenCalledWith({
			where: { jobRoleId: 1 },
		});
		expect(result).toBe(true);
	});

	it("returns false when job role has no applications", async () => {
		vi.mocked(prisma.jobApplication.count).mockResolvedValue(0);

		const result = await dao.hasApplications(1);

		expect(result).toBe(false);
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.jobApplication.count).mockRejectedValue(
			new Error("db error"),
		);

		await expect(dao.hasApplications(1)).rejects.toThrow("db error");
	});
});

describe("JobRoleDao.deleteJobRole", () => {
	let dao: JobRoleDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new JobRoleDao();
	});

	it("deletes a job role by ID", async () => {
		vi.mocked(prisma.jobRole.delete).mockResolvedValue(
			makeJobRole({ jobRoleId: 1, capabilityId: 1, bandId: 1 }),
		);

		await dao.deleteJobRole(1);

		expect(vi.mocked(prisma.jobRole.delete)).toHaveBeenCalledWith({
			where: { jobRoleId: 1 },
		});
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.jobRole.delete).mockRejectedValue(new Error("db error"));

		await expect(dao.deleteJobRole(1)).rejects.toThrow("db error");
	});
});
