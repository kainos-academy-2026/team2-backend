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
				closingDate: rows[0]?.closingDate,
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
				closingDate: rows[1]?.closingDate,
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
