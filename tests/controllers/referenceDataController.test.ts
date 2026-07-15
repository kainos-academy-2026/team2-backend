import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReferenceDataController } from "../../src/controllers/referenceDataController.js";
import type { JobRoleService } from "../../src/services/jobRoleService.js";

describe("ReferenceDataController.getBands", () => {
	const mockGetBands = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();

	let controller: ReferenceDataController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const mockService = {
			getBands: mockGetBands,
		} as unknown as JobRoleService;

		controller = new ReferenceDataController(mockService);
		req = {} as Request;
		res = { status: mockStatus } as unknown as Response;
	});

	it("returns 200 and list of band options", async () => {
		mockGetBands.mockResolvedValue([
			{ id: 1, name: "Band 1" },
			{ id: 2, name: "Band 2" },
		]);

		await controller.getBands(req, res);

		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith([
			{ id: 1, name: "Band 1" },
			{ id: 2, name: "Band 2" },
		]);
	});

	it("returns 200 with empty array when no bands exist", async () => {
		mockGetBands.mockResolvedValue([]);

		await controller.getBands(req, res);

		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith([]);
	});

	it("returns 500 when service throws", async () => {
		mockGetBands.mockRejectedValue(new Error("db error"));

		await controller.getBands(req, res);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});

describe("ReferenceDataController.getCapabilities", () => {
	const mockGetCapabilities = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();

	let controller: ReferenceDataController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const mockService = {
			getCapabilities: mockGetCapabilities,
		} as unknown as JobRoleService;

		controller = new ReferenceDataController(mockService);
		req = {} as Request;
		res = { status: mockStatus } as unknown as Response;
	});

	it("returns 200 and list of capability options", async () => {
		mockGetCapabilities.mockResolvedValue([
			{ id: 1, name: "Engineering" },
			{ id: 2, name: "Design" },
		]);

		await controller.getCapabilities(req, res);

		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith([
			{ id: 1, name: "Engineering" },
			{ id: 2, name: "Design" },
		]);
	});

	it("returns 200 with empty array when no capabilities exist", async () => {
		mockGetCapabilities.mockResolvedValue([]);

		await controller.getCapabilities(req, res);

		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith([]);
	});

	it("returns 500 when service throws", async () => {
		mockGetCapabilities.mockRejectedValue(new Error("db error"));

		await controller.getCapabilities(req, res);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});
