import type { NextFunction, Request, Response } from "express";
import * as jose from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin } from "../../src/middleware/requireAdmin.js";

vi.mock("jose");

describe("requireAdmin middleware", () => {
	const mockNext = vi.fn() as NextFunction;
	const mockJson = vi.fn();
	const mockStatus = vi.fn();
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		process.env.JWT_SECRET_KEY = "test-secret-key";
		mockStatus.mockReturnValue({ json: mockJson });
		res = { status: mockStatus } as unknown as Response;
		req = { headers: {} } as Request;
	});

	describe("happy path", () => {
		it.each([
			["admin"],
			["ADMIN"],
		])("calls next when role is %s (case-insensitive)", async (role) => {
			req = {
				headers: { authorization: "Bearer valid.token" },
			} as unknown as Request;
			vi.mocked(jose.jwtVerify).mockResolvedValue({
				payload: { role },
				protectedHeader: { alg: "HS256" },
			} as unknown as jose.JWTVerifyResult);

			await requireAdmin(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockStatus).not.toHaveBeenCalled();
		});
	});

	describe("unhappy path", () => {
		it.each([
			[{ headers: {} }, "Authorization header is missing"],
			[
				{ headers: { authorization: "Basic dXNlcjpwYXNz" } },
				"Authorization header does not start with Bearer",
			],
		])("returns 401 when %s", async (reqData, _description) => {
			req = reqData as unknown as Request;

			await requireAdmin(req, res, mockNext);

			expect(mockStatus).toHaveBeenCalledWith(401);
			expect(mockJson).toHaveBeenCalledWith({ message: "Unauthorized" });
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("returns 401 when token verification fails", async () => {
			req = {
				headers: { authorization: "Bearer invalid.token" },
			} as unknown as Request;
			vi.mocked(jose.jwtVerify).mockRejectedValue(new Error("invalid token"));

			await requireAdmin(req, res, mockNext);

			expect(mockStatus).toHaveBeenCalledWith(401);
			expect(mockJson).toHaveBeenCalledWith({ message: "Unauthorized" });
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("returns 403 when role is not admin", async () => {
			req = {
				headers: { authorization: "Bearer valid.token" },
			} as unknown as Request;
			vi.mocked(jose.jwtVerify).mockResolvedValue({
				payload: { role: "user" },
				protectedHeader: { alg: "HS256" },
			} as unknown as jose.JWTVerifyResult);

			await requireAdmin(req, res, mockNext);

			expect(mockStatus).toHaveBeenCalledWith(403);
			expect(mockJson).toHaveBeenCalledWith({ message: "Forbidden" });
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("returns 500 when JWT_SECRET_KEY is not set", async () => {
			delete process.env.JWT_SECRET_KEY;
			req = {
				headers: { authorization: "Bearer valid.token" },
			} as unknown as Request;

			await requireAdmin(req, res, mockNext);

			expect(mockStatus).toHaveBeenCalledWith(500);
			expect(mockJson).toHaveBeenCalledWith({
				message: "Internal server error",
			});
			expect(mockNext).not.toHaveBeenCalled();
		});
	});
});
