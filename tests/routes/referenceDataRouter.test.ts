import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetBands = vi.fn();
const mockGetCapabilities = vi.fn();

vi.mock("../../src/services/jobRoleService.js", () => {
	return {
		JobRoleService: class {
			async getBands() {
				return mockGetBands();
			}

			async getCapabilities() {
				return mockGetCapabilities();
			}
		},
	};
});

vi.mock("../../src/middleware/requireAuth.js", () => ({
	requireAuth: vi.fn((_req, _res, next) => next()),
}));

import referenceDataRouter from "../../src/routes/referenceDataRouter.js";

describe("GET /bands", () => {
	const app = express();
	app.use(express.json());
	app.use((_req, res, next) => {
		res.locals.authUser = { role: "user" };
		next();
	});
	app.use(referenceDataRouter);

	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("happy path", () => {
		it("returns 200 with list of bands", async () => {
			mockGetBands.mockResolvedValue([
				{ id: 1, name: "Band 1" },
				{ id: 2, name: "Band 2" },
			]);

			const response = await request(app).get("/bands");

			expect(response.status).toBe(200);
			expect(response.body).toEqual([
				{ id: 1, name: "Band 1" },
				{ id: 2, name: "Band 2" },
			]);
		});
	});

	describe("unhappy path", () => {
		it("returns 401 when not authenticated", async () => {
			const { requireAuth } = await import(
				"../../src/middleware/requireAuth.js"
			);
			vi.mocked(requireAuth).mockImplementationOnce((_req, res, _next) => {
				res.status(401).json({ message: "Unauthorized" });
			});

			const response = await request(app).get("/bands");

			expect(response.status).toBe(401);
			expect(response.body).toEqual({ message: "Unauthorized" });
		});

		it("returns 500 when service fails", async () => {
			mockGetBands.mockRejectedValue(new Error("db error"));

			const response = await request(app).get("/bands");

			expect(response.status).toBe(500);
			expect(response.body).toEqual({ message: "Internal server error" });
		});
	});
});

describe("GET /capabilities", () => {
	const app = express();
	app.use(express.json());
	app.use((_req, res, next) => {
		res.locals.authUser = { role: "user" };
		next();
	});
	app.use(referenceDataRouter);

	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("happy path", () => {
		it("returns 200 with list of capabilities", async () => {
			mockGetCapabilities.mockResolvedValue([
				{ id: 1, name: "Engineering" },
				{ id: 2, name: "Design" },
			]);

			const response = await request(app).get("/capabilities");

			expect(response.status).toBe(200);
			expect(response.body).toEqual([
				{ id: 1, name: "Engineering" },
				{ id: 2, name: "Design" },
			]);
		});
	});

	describe("unhappy path", () => {
		it("returns 401 when not authenticated", async () => {
			const { requireAuth } = await import(
				"../../src/middleware/requireAuth.js"
			);
			vi.mocked(requireAuth).mockImplementationOnce((_req, res, _next) => {
				res.status(401).json({ message: "Unauthorized" });
			});

			const response = await request(app).get("/capabilities");

			expect(response.status).toBe(401);
			expect(response.body).toEqual({ message: "Unauthorized" });
		});

		it("returns 500 when service fails", async () => {
			mockGetCapabilities.mockRejectedValue(new Error("db error"));

			const response = await request(app).get("/capabilities");

			expect(response.status).toBe(500);
			expect(response.body).toEqual({ message: "Internal server error" });
		});
	});
});
