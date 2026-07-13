import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleDao } from "../../src/daos/jobRoleDao.js";
import { makeJobRole } from "../fixtures/jobRoleFixtures.js";

vi.mock("../../src/lib/prisma.js", () => ({
	prisma: {
		jobRole: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
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
		const role1 = makeJobRole({ jobRoleId: 1 });
		const role2 = makeJobRole({ jobRoleId: 2 });
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
		const role = makeJobRole({ jobRoleId: 5 });
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
		const role = makeJobRole({ jobRoleId: 42 });
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
