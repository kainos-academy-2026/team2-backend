import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterUserController } from "../../src/controllers/registerUserController.js";
import { DuplicateUserEmailError } from "../../src/errors/userErrors.js";
import type { RegisterUserService } from "../../src/services/registerUserService.js";

describe("RegisterUserController.register", () => {
	const mockRegisterUser = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();
	let controller: RegisterUserController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const mockService = {
			registerUser: mockRegisterUser,
		} as unknown as RegisterUserService;

		controller = new RegisterUserController(mockService);
		req = { body: {} } as Request;
		res = { status: mockStatus } as unknown as Response;
	});

	it("returns 201 after registering a valid user", async () => {
		mockRegisterUser.mockResolvedValue(undefined);
		req = {
			body: {
				fullName: "Test User",
				email: "test.user@example.com",
				password: "Strong!Pass9",
			},
		} as Request;

		await controller.register(req, res);

		expect(mockRegisterUser).toHaveBeenCalledWith({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "Strong!Pass9",
		});
		expect(mockStatus).toHaveBeenCalledWith(201);
		expect(mockJson).toHaveBeenCalledWith({
			message: "Account created successfully",
		});
	});

	it("returns 409 when the service reports a duplicate email", async () => {
		mockRegisterUser.mockRejectedValue(new DuplicateUserEmailError());
		req = {
			body: {
				fullName: "Test User",
				email: "test.user@example.com",
				password: "Strong!Pass9",
			},
		} as Request;

		await controller.register(req, res);

		expect(mockStatus).toHaveBeenCalledWith(409);
		expect(mockJson).toHaveBeenCalledWith({ message: "Email already exists" });
	});

	it("returns 500 when the service throws an unexpected error", async () => {
		const unexpectedError = new Error("Database timeout");
		mockRegisterUser.mockRejectedValue(unexpectedError);
		req = {
			body: {
				fullName: "Test User",
				email: "test.user@example.com",
				password: "Strong!Pass9",
			},
		} as Request;

		await controller.register(req, res);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});
