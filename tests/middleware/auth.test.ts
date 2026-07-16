import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type TokenService from "../../src/interfaces/tokenService.js";
import {
	authenticateRequest,
	requireAdmin,
	requireAnyRole,
} from "../../src/middleware/auth.js";
import { Role } from "../../src/models/user.js";

describe("authenticateRequest", () => {
	const mockVerify = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns 401 when Authorization header is missing", async () => {
		const middleware = authenticateRequest({
			verify: mockVerify,
			create: vi.fn(),
		} as unknown as TokenService);
		const req = {
			header: vi.fn().mockReturnValue(undefined),
		} as unknown as Request;
		const json = vi.fn();
		const status = vi.fn().mockReturnValue({ json });
		const res = { status, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		await middleware(req, res, next);

		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ message: "Unauthorized" });
		expect(next).not.toHaveBeenCalled();
	});

	it("stores auth user and calls next for valid token", async () => {
		mockVerify.mockResolvedValue({
			sub: "123",
			email: "user@example.com",
			name: "User",
			role: "user",
		});
		const middleware = authenticateRequest({
			verify: mockVerify,
			create: vi.fn(),
		} as unknown as TokenService);
		const req = {
			header: vi.fn().mockReturnValue("Bearer test-token"),
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		await middleware(req, res, next);

		expect(redirect).not.toHaveBeenCalled();
		expect(res.locals).toMatchObject({
			authUser: {
				userId: "123",
				email: "user@example.com",
				name: "User",
				role: "user",
			},
		});
		expect(next).toHaveBeenCalledTimes(1);
	});

	it("returns 401 when token verification fails", async () => {
		mockVerify.mockRejectedValue(new Error("invalid token"));
		const middleware = authenticateRequest({
			verify: mockVerify,
			create: vi.fn(),
		} as unknown as TokenService);
		const req = {
			header: vi.fn().mockReturnValue("Bearer bad-token"),
		} as unknown as Request;
		const json = vi.fn();
		const status = vi.fn().mockReturnValue({ json });
		const res = { status, locals: {} } as unknown as Response;
		const next = vi.fn() as NextFunction;

		await middleware(req, res, next);

		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ message: "Unauthorized" });
		expect(next).not.toHaveBeenCalled();
	});
});

describe("requireAnyRole", () => {
	it("allows request when role is permitted", () => {
		const middleware = requireAnyRole([Role.User, Role.Admin]);
		const req = {} as Request;
		const status = vi.fn();
		const json = vi.fn();
		status.mockReturnValue({ json });
		const res = {
			locals: { authUser: { role: Role.User } },
			status,
		} as unknown as Response;
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(status).not.toHaveBeenCalled();
	});

	it("returns 403 when role is not permitted", () => {
		const middleware = requireAnyRole([Role.Admin]);
		const req = {} as Request;
		const json = vi.fn();
		const status = vi.fn().mockReturnValue({ json });
		const res = {
			locals: { authUser: { role: Role.User } },
			status,
		} as unknown as Response;
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(status).toHaveBeenCalledWith(403);
		expect(json).toHaveBeenCalledWith({ message: "Forbidden" });
		expect(next).not.toHaveBeenCalled();
	});
});

describe("requireAdmin", () => {
	it("allows request when role is admin", () => {
		const req = {} as Request;
		const status = vi.fn();
		const json = vi.fn();
		status.mockReturnValue({ json });
		const res = {
			locals: { authUser: { role: Role.Admin } },
			status,
		} as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAdmin(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(status).not.toHaveBeenCalled();
	});

	it("returns 403 when role is not admin", () => {
		const req = {} as Request;
		const json = vi.fn();
		const status = vi.fn().mockReturnValue({ json });
		const res = {
			locals: { authUser: { role: Role.User } },
			status,
		} as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAdmin(req, res, next);

		expect(status).toHaveBeenCalledWith(403);
		expect(json).toHaveBeenCalledWith({ message: "Forbidden" });
		expect(next).not.toHaveBeenCalled();
	});
});
