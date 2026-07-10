import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController.js";
import type { JobRoleService } from "../../src/services/jobRoleService.js";
import { makeJobRole } from "../fixtures/jobRoleFixtures.js";

describe("JobRoleController.getAll", () => {
	const mockFindAllOpen = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();

	let controller: JobRoleController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const mockService = {
			findAllOpen: mockFindAllOpen,
		} as unknown as JobRoleService;

		controller = new JobRoleController(mockService);
		req = {} as Request;
		res = {
			status: mockStatus,
		} as unknown as Response;
	});

	it("returns 200 and mapped job roles", async () => {
		const rows = [
			{
				roleName: "Backend Engineer",
				location: "Cork",
				capability: "Engineering",
				band: "Band 1",
				closingDate: makeJobRole().closingDate.toISOString(),
				status: "OPEN",
				description: "Write APIs.",
				responsibilities: [],
				sharepointUrl: "",
				numberOfOpenPositions: 1,
			},
		];
		mockFindAllOpen.mockResolvedValue(rows);

		await controller.getAll(req, res);

		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith(rows);
	});

	it("returns 200 and an empty array when no roles exist", async () => {
		mockFindAllOpen.mockResolvedValue([]);

		await controller.getAll(req, res);

		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith([]);
	});

	it("returns 500 when service throws", async () => {
		mockFindAllOpen.mockRejectedValue(new Error("boom"));

		await controller.getAll(req, res);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({ error: "Internal server error" });
	});
});
