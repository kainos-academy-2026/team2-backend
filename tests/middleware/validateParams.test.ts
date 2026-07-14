import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validateParams } from "../../src/middleware/validateParams.js";

describe("validateParams", () => {
	it("parses and validates params when input is valid", () => {
		const middleware = validateParams(
			z.object({
				id: z.coerce.number().int().positive(),
			}),
		);
		const req = { params: { id: "42" } } as Request;
		const res = {} as Response;
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.params).toEqual({ id: 42 });
	});

	it("returns 400 and first validation message when input is invalid", () => {
		const middleware = validateParams(
			z.object({
				id: z.coerce.number().int().positive("ID must be a positive number"),
			}),
		);
		const req = { params: { id: "-5" } } as Request;
		const json = vi.fn();
		const status = vi.fn().mockReturnValue({ json });
		const res = { status } as unknown as Response;
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({
			message: "ID must be a positive number",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 400 with default message when validation fails and no custom message provided", () => {
		const middleware = validateParams(
			z.object({
				id: z.string().uuid(),
			}),
		);
		const req = { params: { id: "not-a-uuid" } } as Request;
		const json = vi.fn();
		const status = vi.fn().mockReturnValue({ json });
		const res = { status } as unknown as Response;
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalled();
		const call = vi.mocked(status).mock.calls[0];
		expect(call[0]).toBe(400);
	});

	it("handles missing params gracefully", () => {
		const middleware = validateParams(
			z.object({
				id: z.coerce.number(),
			}),
		);
		const req = { params: undefined } as unknown as Request;
		const json = vi.fn();
		const status = vi.fn().mockReturnValue({ json });
		const res = { status } as unknown as Response;
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(status).toHaveBeenCalledWith(400);
		expect(next).not.toHaveBeenCalled();
	});

	it("calls next() when validation passes", () => {
		const middleware = validateParams(
			z.object({
				userId: z.string().min(1),
				roleId: z.coerce.number().positive(),
			}),
		);
		const req = { params: { userId: "abc123", roleId: "5" } } as Request;
		const res = {} as Response;
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.params).toEqual({ userId: "abc123", roleId: 5 });
	});
});
