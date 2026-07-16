import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	JobRoleHasApplicationsError,
	JobRoleNotFoundError,
} from "../../src/errors/jobApplicationErrors.js";
import { InvalidReferenceDataError } from "../../src/errors/jobRoleErrors.js";
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

	it("returns band id/name options from the DAO", async () => {
		mockFindBands.mockResolvedValue([
			{ nameId: 1, bandName: "Band 1" },
			{ nameId: 2, bandName: "Band 2" },
		]);

		const result = await service.getBands();

		expect(result).toEqual([
			{ id: 1, name: "Band 1" },
			{ id: 2, name: "Band 2" },
		]);
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

	it("returns capability id/name options from the DAO", async () => {
		mockFindCapabilities.mockResolvedValue([
			{ capabilityId: 1, capabilityName: "Engineering" },
			{ capabilityId: 2, capabilityName: "Design" },
		]);

		const result = await service.getCapabilities();

		expect(result).toEqual([
			{ id: 1, name: "Engineering" },
			{ id: 2, name: "Design" },
		]);
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
	const mockCreateJobRole = vi.fn();
	const mockFindCapabilities = vi.fn();
	const mockFindBands = vi.fn();
	const mockToCreateInput = vi.fn();
	const mockToResponse = vi.fn();

	let service: JobRoleService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockDao = {
			createJobRole: mockCreateJobRole,
			findCapabilities: mockFindCapabilities,
			findBands: mockFindBands,
		};
		const mockMapper = {
			toCreateInput: mockToCreateInput,
			toResponse: mockToResponse,
		};
		service = new JobRoleService(mockDao as never, mockMapper as never);
	});

	it("creates a job role and returns the mapped DTO", async () => {
		const dto = {
			name: "QA Engineer",
			location: "Galway",
			capabilityId: 1,
			bandId: 2,
			closingDate: "2026-08-31",
		};
		const mappedInput = {
			roleName: "QA Engineer",
			location: "Galway",
			capabilityId: 1,
			bandId: 2,
			closingDate: new Date("2026-08-31"),
			description: "",
			sharepointUrl: "",
			responsibilities: [],
			numberOfOpenPositions: 0,
		};
		const createdRow = makeJobRole({
			jobRoleId: 10,
			capabilityId: 1,
			bandId: 2,
		});
		const mappedResponse = {
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
		};

		mockToCreateInput.mockReturnValue(mappedInput);
		mockCreateJobRole.mockResolvedValue(createdRow);
		mockFindCapabilities.mockResolvedValue([
			{ capabilityId: 1, capabilityName: "Engineering" },
		]);
		mockFindBands.mockResolvedValue([{ nameId: 2, bandName: "Band 2" }]);
		mockToResponse.mockReturnValue(mappedResponse);

		const result = await service.createJobRole(dto);

		expect(mockToCreateInput).toHaveBeenCalledWith(dto);
		expect(mockCreateJobRole).toHaveBeenCalledWith(mappedInput);
		expect(mockToResponse).toHaveBeenCalledWith(
			createdRow,
			"Engineering",
			"Band 2",
		);
		expect(result).toEqual(mappedResponse);
	});

	it("propagates DAO errors", async () => {
		mockCreateJobRole.mockRejectedValue(new Error("db down"));

		await expect(
			service.createJobRole({
				name: "Architect",
				location: "Belfast",
				capabilityId: 1,
				bandId: 2,
				closingDate: "2026-12-31",
			}),
		).rejects.toThrow("db down");
	});

	it("throws InvalidReferenceDataError for foreign-key violations", async () => {
		mockCreateJobRole.mockRejectedValue({ code: "P2003" });

		await expect(
			service.createJobRole({
				name: "Architect",
				location: "Belfast",
				capabilityId: 999,
				bandId: 999,
				closingDate: "2026-12-31",
			}),
		).rejects.toBeInstanceOf(InvalidReferenceDataError);
	});
});

describe("JobRoleService.deleteRole", () => {
	const mockFindJobRoleById = vi.fn();
	const mockHasApplications = vi.fn();
	const mockDeleteJobRole = vi.fn();

	let service: JobRoleService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockDao = {
			findJobRoleById: mockFindJobRoleById,
			hasApplications: mockHasApplications,
			deleteJobRole: mockDeleteJobRole,
		};
		service = new JobRoleService(mockDao as never, new JobRoleMapper());
	});

	it("deletes the job role when it exists and has no applications", async () => {
		const role = makeJobRole({ jobRoleId: 1 });
		mockFindJobRoleById.mockResolvedValue(role);
		mockHasApplications.mockResolvedValue(false);
		mockDeleteJobRole.mockResolvedValue(undefined);

		await service.deleteRole("1");

		expect(mockFindJobRoleById).toHaveBeenCalledWith("1");
		expect(mockHasApplications).toHaveBeenCalledWith(role.jobRoleId);
		expect(mockDeleteJobRole).toHaveBeenCalledWith(role.jobRoleId);
	});

	it("throws JobRoleNotFoundError when job role does not exist", async () => {
		mockFindJobRoleById.mockResolvedValue(null);

		await expect(service.deleteRole("999")).rejects.toThrow(
			JobRoleNotFoundError,
		);
		expect(mockHasApplications).not.toHaveBeenCalled();
		expect(mockDeleteJobRole).not.toHaveBeenCalled();
	});

	it("throws JobRoleHasApplicationsError when job role has applications", async () => {
		const role = makeJobRole({ jobRoleId: 1 });
		mockFindJobRoleById.mockResolvedValue(role);
		mockHasApplications.mockResolvedValue(true);

		await expect(service.deleteRole("1")).rejects.toThrow(
			JobRoleHasApplicationsError,
		);
		expect(mockDeleteJobRole).not.toHaveBeenCalled();
	});

	it("propagates DAO errors from findJobRoleById", async () => {
		mockFindJobRoleById.mockRejectedValue(new Error("db error"));

		await expect(service.deleteRole("1")).rejects.toThrow("db error");
	});

	it("propagates DAO errors from deleteJobRole", async () => {
		const role = makeJobRole({ jobRoleId: 1 });
		mockFindJobRoleById.mockResolvedValue(role);
		mockHasApplications.mockResolvedValue(false);
		mockDeleteJobRole.mockRejectedValue(new Error("db error"));

		await expect(service.deleteRole("1")).rejects.toThrow("db error");
	});
});
