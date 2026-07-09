import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validateBody } from "../../src/middleware/validateBody.js";

describe("validateBody", () => {
	it("parses and replaces req.body when input is valid", () => {
		const middleware = validateBody(
			z.object({
				age: z.coerce.number().int().positive(),
			}),
		);
		const req = { body: { age: "42" } } as Request;
		const res = {} as Response;
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(req.body).toEqual({ age: 42 });
		expect(next).toHaveBeenCalledTimes(1);
	});

	it("returns 400 and first validation message when input is invalid", () => {
		const middleware = validateBody(
			z.object({
				email: z.string().email("Invalid email format"),
			}),
		);
		const req = { body: { email: "not-an-email" } } as Request;
		const json = vi.fn();
		const status = vi.fn().mockReturnValue({ json });
		const res = { status } as unknown as Response;
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({ message: "Invalid email format" });
		expect(next).not.toHaveBeenCalled();
	});
});
