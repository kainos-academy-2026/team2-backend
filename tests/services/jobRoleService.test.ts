import { beforeEach, describe, expect, it, vi } from "vitest";
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
		service = new JobRoleService(mockDao as never);
	});

	it("returns open job roles from the DAO", async () => {
		const rows = [makeJobRole({ jobRoleId: 1 }), makeJobRole({ jobRoleId: 2 })];
		mockFindOpenJobRoles.mockResolvedValue(rows);

		const result = await service.findAllOpen();

		expect(mockFindOpenJobRoles).toHaveBeenCalledTimes(1);
		expect(result).toEqual(rows);
	});

	it("propagates DAO errors", async () => {
		mockFindOpenJobRoles.mockRejectedValue(new Error("db down"));

		await expect(service.findAllOpen()).rejects.toThrow("db down");
	});
});
