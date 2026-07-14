import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleMapper } from "../../src/mappers/jobRoleMapper.js";
import { JobRoleService } from "../../src/services/jobRoleService.js";
import { makeJobRole } from "../fixtures/jobRoleFixtures.js";

describe("JobRoleService.findAllOpen", () => {
	const mockFindOpenJobRoles = vi.fn();

	let service: JobRoleService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockDao = {
			findOpenJobRoles: mockFindOpenJobRoles,
		};
		service = new JobRoleService(mockDao as never, new JobRoleMapper());
	});

	it("returns open job roles from the DAO", async () => {
		const rows = [makeJobRole({ jobRoleId: 1 }), makeJobRole({ jobRoleId: 2 })];
		mockFindOpenJobRoles.mockResolvedValue(rows);

		const result = await service.findAllOpen();

		expect(mockFindOpenJobRoles).toHaveBeenCalledTimes(1);
		expect(result).toEqual([
			{
				jobRoleId: rows[0]?.jobRoleId,
				roleName: rows[0]?.roleName,
				location: rows[0]?.location,
				capability: rows[0]?.capability.capabilityName,
				band: rows[0]?.band.bandName,
				closingDate: rows[0]?.closingDate.toISOString(),
				status: rows[0]?.status,
				description: rows[0]?.description,
				responsibilities: rows[0]?.responsibilities,
				sharepointUrl: rows[0]?.sharepointUrl,
				numberOfOpenPositions: rows[0]?.numberOfOpenPositions,
			},
			{
				jobRoleId: rows[1]?.jobRoleId,
				roleName: rows[1]?.roleName,
				location: rows[1]?.location,
				capability: rows[1]?.capability.capabilityName,
				band: rows[1]?.band.bandName,
				closingDate: rows[1]?.closingDate.toISOString(),
				status: rows[1]?.status,
				description: rows[1]?.description,
				responsibilities: rows[1]?.responsibilities,
				sharepointUrl: rows[1]?.sharepointUrl,
				numberOfOpenPositions: rows[1]?.numberOfOpenPositions,
			},
		]);
	});

	it("propagates DAO errors", async () => {
		mockFindOpenJobRoles.mockRejectedValue(new Error("db down"));

		await expect(service.findAllOpen()).rejects.toThrow("db down");
	});
});

describe("JobRoleService.findById", () => {
	const mockFindJobRoleById = vi.fn();

	let service: JobRoleService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockDao = {
			findJobRoleById: mockFindJobRoleById,
		};
		service = new JobRoleService(mockDao as never, new JobRoleMapper());
	});

	it("returns mapped job role when found", async () => {
		const row = makeJobRole({ jobRoleId: 5 });
		mockFindJobRoleById.mockResolvedValue(row);

		const result = await service.findById("5");

		expect(mockFindJobRoleById).toHaveBeenCalledWith("5");
		expect(result).toEqual({
			jobRoleId: row.jobRoleId,
			roleName: row.roleName,
			location: row.location,
			capability: row.capability.capabilityName,
			band: row.band.bandName,
			closingDate: row.closingDate.toISOString(),
			status: row.status,
			description: row.description,
			responsibilities: row.responsibilities,
			sharepointUrl: row.sharepointUrl,
			numberOfOpenPositions: row.numberOfOpenPositions,
		});
	});

	it("returns null when job role not found", async () => {
		mockFindJobRoleById.mockResolvedValue(null);

		const result = await service.findById("999");

		expect(mockFindJobRoleById).toHaveBeenCalledWith("999");
		expect(result).toBeNull();
	});

	it("propagates DAO errors", async () => {
		mockFindJobRoleById.mockRejectedValue(new Error("db timeout"));

		await expect(service.findById("1")).rejects.toThrow("db timeout");
	});
});

describe("JobRoleService.getBands", () => {
	const mockFindBands = vi.fn();

	let service: JobRoleService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockDao = {
			findBands: mockFindBands,
		};
		service = new JobRoleService(mockDao as never, new JobRoleMapper());
	});

	it("returns band names from the DAO", async () => {
		mockFindBands.mockResolvedValue([
			{ nameId: 1, bandName: "Band 1" },
			{ nameId: 2, bandName: "Band 2" },
		]);

		const result = await service.getBands();

		expect(result).toEqual(["Band 1", "Band 2"]);
	});

	it("returns empty array when no bands exist", async () => {
		mockFindBands.mockResolvedValue([]);

		const result = await service.getBands();

		expect(result).toEqual([]);
	});

	it("propagates DAO errors", async () => {
		mockFindBands.mockRejectedValue(new Error("db down"));

		await expect(service.getBands()).rejects.toThrow("db down");
	});
});

describe("JobRoleService.getCapabilities", () => {
	const mockFindCapabilities = vi.fn();

	let service: JobRoleService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockDao = {
			findCapabilities: mockFindCapabilities,
		};
		service = new JobRoleService(mockDao as never, new JobRoleMapper());
	});

	it("returns capability names from the DAO", async () => {
		mockFindCapabilities.mockResolvedValue([
			{ capabilityId: 1, capabilityName: "Engineering" },
			{ capabilityId: 2, capabilityName: "Design" },
		]);

		const result = await service.getCapabilities();

		expect(result).toEqual(["Engineering", "Design"]);
	});

	it("returns empty array when no capabilities exist", async () => {
		mockFindCapabilities.mockResolvedValue([]);

		const result = await service.getCapabilities();

		expect(result).toEqual([]);
	});

	it("propagates DAO errors", async () => {
		mockFindCapabilities.mockRejectedValue(new Error("db down"));

		await expect(service.getCapabilities()).rejects.toThrow("db down");
	});
});

describe("JobRoleService.createJobRole", () => {
	const mockFindBandByName = vi.fn();
	const mockFindCapabilityByName = vi.fn();
	const mockCreateJobRole = vi.fn();

	let service: JobRoleService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockDao = {
			findBandByName: mockFindBandByName,
			findCapabilityByName: mockFindCapabilityByName,
			createJobRole: mockCreateJobRole,
		};
		service = new JobRoleService(mockDao as never, new JobRoleMapper());
	});

	it("creates a job role and returns the mapped DTO", async () => {
		const band = { nameId: 2, bandName: "B5" };
		const capability = { capabilityId: 1, capabilityName: "Engineering" };
		const createdRow = makeJobRole({
			jobRoleId: 10,
			capabilityId: capability.capabilityId,
			bandId: band.nameId,
		});

		mockFindBandByName.mockResolvedValue(band);
		mockFindCapabilityByName.mockResolvedValue(capability);
		mockCreateJobRole.mockResolvedValue(createdRow);

		const result = await service.createJobRole({
			name: createdRow.roleName,
			location: createdRow.location,
			capability: capability.capabilityName,
			band: band.bandName,
			closingDate: createdRow.closingDate.toISOString().split("T")[0] as string,
		});

		expect(mockFindBandByName).toHaveBeenCalledWith(band.bandName);
		expect(mockFindCapabilityByName).toHaveBeenCalledWith(
			capability.capabilityName,
		);
		expect(mockCreateJobRole).toHaveBeenCalledWith(
			expect.objectContaining({
				capabilityId: capability.capabilityId,
				bandId: band.nameId,
				roleName: createdRow.roleName,
				location: createdRow.location,
			}),
		);
		expect(result).toEqual({
			jobRoleId: createdRow.jobRoleId,
			roleName: createdRow.roleName,
			location: createdRow.location,
			capability: createdRow.capability.capabilityName,
			band: createdRow.band.bandName,
			closingDate: createdRow.closingDate.toISOString(),
			status: createdRow.status,
			description: createdRow.description,
			responsibilities: createdRow.responsibilities,
			sharepointUrl: createdRow.sharepointUrl,
			numberOfOpenPositions: createdRow.numberOfOpenPositions,
		});
	});

	it("throws BandNotFoundError when band does not exist", async () => {
		const { BandNotFoundError } = await import(
			"../../src/errors/jobRoleErrors.js"
		);
		mockFindBandByName.mockResolvedValue(null);

		await expect(
			service.createJobRole({
				name: "Architect",
				location: "Belfast",
				capability: "Engineering",
				band: "Unknown Band",
				closingDate: "2026-12-31",
			}),
		).rejects.toThrow(BandNotFoundError);
	});

	it("throws CapabilityNotFoundError when capability does not exist", async () => {
		const { CapabilityNotFoundError } = await import(
			"../../src/errors/jobRoleErrors.js"
		);
		mockFindBandByName.mockResolvedValue({ nameId: 1, bandName: "B5" });
		mockFindCapabilityByName.mockResolvedValue(null);

		await expect(
			service.createJobRole({
				name: "Architect",
				location: "Belfast",
				capability: "Unknown Capability",
				band: "B5",
				closingDate: "2026-12-31",
			}),
		).rejects.toThrow(CapabilityNotFoundError);
	});
});
