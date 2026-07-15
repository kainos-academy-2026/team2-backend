import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleDao } from "../../src/daos/jobRoleDao.js";
import { makeJobRole } from "../fixtures/jobRoleFixtures.js";

vi.mock("../../src/lib/prisma.js", () => ({
	prisma: {
		jobRole: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
		},
		band: {
			findMany: vi.fn(),
			findFirst: vi.fn(),
		},
		capability: {
			findMany: vi.fn(),
			findFirst: vi.fn(),
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

describe("JobRoleDao.findBands", () => {
	let dao: JobRoleDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new JobRoleDao();
	});

	it("returns all bands from the database", async () => {
		const bands = [
			{ nameId: 1, bandName: "Band 1" },
			{ nameId: 2, bandName: "Band 2" },
		];
		vi.mocked(prisma.band.findMany).mockResolvedValue(bands);

		const result = await dao.findBands();

		expect(vi.mocked(prisma.band.findMany)).toHaveBeenCalledWith({
			select: { nameId: true, bandName: true },
		});
		expect(result).toEqual(bands);
	});

	it("returns empty array when no bands exist", async () => {
		vi.mocked(prisma.band.findMany).mockResolvedValue([]);

		const result = await dao.findBands();

		expect(result).toEqual([]);
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.band.findMany).mockRejectedValue(new Error("db error"));

		await expect(dao.findBands()).rejects.toThrow("db error");
	});
});

describe("JobRoleDao.findCapabilities", () => {
	let dao: JobRoleDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new JobRoleDao();
	});

	it("returns all capabilities from the database", async () => {
		const capabilities = [
			{ capabilityId: 1, capabilityName: "Engineering" },
			{ capabilityId: 2, capabilityName: "Design" },
		];
		vi.mocked(prisma.capability.findMany).mockResolvedValue(capabilities);

		const result = await dao.findCapabilities();

		expect(vi.mocked(prisma.capability.findMany)).toHaveBeenCalledWith({
			select: { capabilityId: true, capabilityName: true },
		});
		expect(result).toEqual(capabilities);
	});

	it("returns empty array when no capabilities exist", async () => {
		vi.mocked(prisma.capability.findMany).mockResolvedValue([]);

		const result = await dao.findCapabilities();

		expect(result).toEqual([]);
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.capability.findMany).mockRejectedValue(
			new Error("db error"),
		);

		await expect(dao.findCapabilities()).rejects.toThrow("db error");
	});
});

describe("JobRoleDao.createJobRole", () => {
	let dao: JobRoleDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new JobRoleDao();
	});

	it("creates a job role and returns it", async () => {
		const input = {
			roleName: "Technical Architect",
			location: "Belfast",
			capabilityId: 1,
			bandId: 2,
			closingDate: new Date("2026-12-31"),
			description: "Architect solutions",
			sharepointUrl: "https://example.com/spec",
			responsibilities: ["Design systems"],
			numberOfOpenPositions: 2,
		};
		const created = makeJobRole({
			jobRoleId: 10,
			roleName: input.roleName,
			location: input.location,
			capabilityId: input.capabilityId,
			bandId: input.bandId,
		});
		vi.mocked(prisma.jobRole.create).mockResolvedValue(created);

		const result = await dao.createJobRole(input);

		expect(vi.mocked(prisma.jobRole.create)).toHaveBeenCalledWith({
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
		expect(result).toEqual(created);
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.jobRole.create).mockRejectedValue(new Error("db error"));

		await expect(
			dao.createJobRole({
				roleName: "Architect",
				location: "Belfast",
				capabilityId: 1,
				bandId: 2,
				closingDate: new Date(),
				description: "",
				sharepointUrl: "",
				responsibilities: [],
				numberOfOpenPositions: 0,
			}),
		).rejects.toThrow("db error");
	});
});
