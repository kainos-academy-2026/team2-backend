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
				capabilityId: 1,
				bandId: 2,
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

	it("returns 400 when reference data ids are invalid", async () => {
		const { InvalidReferenceDataError } = await import(
			"../../src/errors/jobRoleErrors.js"
		);
		mockCreateJobRole.mockRejectedValue(new InvalidReferenceDataError());

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
