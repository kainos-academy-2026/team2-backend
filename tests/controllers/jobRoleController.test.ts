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
		expect(mockJson).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});

describe("JobRoleController.getById", () => {
	const mockFindById = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();

	let controller: JobRoleController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const mockService = {
			findById: mockFindById,
		} as unknown as JobRoleService;

		controller = new JobRoleController(mockService);
		req = { params: { id: "1" } } as unknown as Request;
		res = {
			status: mockStatus,
		} as unknown as Response;
	});

	it("returns 200 and mapped job role when found", async () => {
		const jobRole = {
			jobRoleId: 1,
			roleName: "Backend Engineer",
			location: "Cork",
			capability: "Engineering",
			band: "Band 1",
			closingDate: makeJobRole().closingDate.toISOString(),
			status: "OPEN",
			description: "Write APIs.",
			responsibilities: ["Code", "Review"],
			sharepointUrl: "https://example.com/job",
			numberOfOpenPositions: 1,
		};
		mockFindById.mockResolvedValue(jobRole);

		await controller.getById(req, res);

		expect(mockFindById).toHaveBeenCalledWith("1");
		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith(jobRole);
	});

	it("returns 404 when job role not found", async () => {
		mockFindById.mockResolvedValue(null);

		await controller.getById(req, res);

		expect(mockFindById).toHaveBeenCalledWith("1");
		expect(mockStatus).toHaveBeenCalledWith(404);
		expect(mockJson).toHaveBeenCalledWith({ message: "Job role not found" });
	});

	it("returns 400 when job role ID is missing", async () => {
		req = { params: {} } as unknown as Request;

		await controller.getById(req, res);

		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockJson).toHaveBeenCalledWith({
			message: "Job role ID is required",
		});
		expect(mockFindById).not.toHaveBeenCalled();
	});

	it("returns 500 when service throws", async () => {
		mockFindById.mockRejectedValue(new Error("db error"));

		await controller.getById(req, res);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});

describe("JobRoleController.getBands", () => {
	const mockGetBands = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();

	let controller: JobRoleController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const mockService = {
			getBands: mockGetBands,
		} as unknown as JobRoleService;

		controller = new JobRoleController(mockService);
		req = {} as Request;
		res = { status: mockStatus } as unknown as Response;
	});

	it("returns 200 and list of band names", async () => {
		mockGetBands.mockResolvedValue(["Band 1", "Band 2"]);

		await controller.getBands(req, res);

		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith(["Band 1", "Band 2"]);
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

describe("JobRoleController.getCapabilities", () => {
	const mockGetCapabilities = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();

	let controller: JobRoleController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const mockService = {
			getCapabilities: mockGetCapabilities,
		} as unknown as JobRoleService;

		controller = new JobRoleController(mockService);
		req = {} as Request;
		res = { status: mockStatus } as unknown as Response;
	});

	it("returns 200 and list of capability names", async () => {
		mockGetCapabilities.mockResolvedValue(["Engineering", "Design"]);

		await controller.getCapabilities(req, res);

		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith(["Engineering", "Design"]);
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

describe("JobRoleController.create", () => {
	const mockCreateJobRole = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();

	let controller: JobRoleController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const mockService = {
			createJobRole: mockCreateJobRole,
		} as unknown as JobRoleService;

		controller = new JobRoleController(mockService);
		req = {
			body: {
				name: "Technical Architect",
				location: "Belfast",
				capability: "Engineering",
				band: "B5",
				closingDate: "2026-12-31",
			},
		} as unknown as Request;
		res = { status: mockStatus } as unknown as Response;
	});

	it("returns 201 and the created job role on success", async () => {
		const created = makeJobRole({ jobRoleId: 10 });
		const dto = {
			jobRoleId: 10,
			roleName: created.roleName,
			location: created.location,
			capability: created.capability.capabilityName,
			band: created.band.bandName,
			closingDate: created.closingDate.toISOString(),
			status: "OPEN",
			description: created.description,
			responsibilities: created.responsibilities,
			sharepointUrl: created.sharepointUrl,
			numberOfOpenPositions: created.numberOfOpenPositions,
		};
		mockCreateJobRole.mockResolvedValue(dto);

		await controller.create(req, res);

		expect(mockStatus).toHaveBeenCalledWith(201);
		expect(mockJson).toHaveBeenCalledWith(dto);
	});

	it("returns 400 when band is not found", async () => {
		const { BandNotFoundError } = await import(
			"../../src/errors/jobRoleErrors.js"
		);
		mockCreateJobRole.mockRejectedValue(new BandNotFoundError());

		await controller.create(req, res);

		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockJson).toHaveBeenCalledWith({
			message: "Invalid band or capability",
		});
	});

	it("returns 400 when capability is not found", async () => {
		const { CapabilityNotFoundError } = await import(
			"../../src/errors/jobRoleErrors.js"
		);
		mockCreateJobRole.mockRejectedValue(new CapabilityNotFoundError());

		await controller.create(req, res);

		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockJson).toHaveBeenCalledWith({
			message: "Invalid band or capability",
		});
	});

	it("returns 500 when service throws an unexpected error", async () => {
		mockCreateJobRole.mockRejectedValue(new Error("unexpected"));

		await controller.create(req, res);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});
