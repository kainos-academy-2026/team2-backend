import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginController } from "../../src/controllers/loginController.js";
import type LoginService from "../../src/services/loginService.js";
import {
	InvalidCredentialsError,
	UserNotFoundError,
} from "../../src/errors/userErrors.js";

describe("LoginController.login", () => {
	const mockLogin = vi.fn();
	const mockStatus = vi.fn();
	const mockJson = vi.fn();
	let controller: LoginController;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		vi.resetAllMocks();
		mockStatus.mockReturnValue({ json: mockJson });

		const loginService = {
			login: mockLogin,
		} as unknown as LoginService;

		controller = new LoginController(loginService);
		req = { body: {} } as Request;
		res = { status: mockStatus } as unknown as Response;
	});

	it("returns 200 with token when login succeeds", async () => {
		mockLogin.mockResolvedValue({ token: "jwt-token" });
		req = {
			body: { email: "exampleuser1@hotmail.com", password: "password123" },
		} as Request;

		await controller.login(req, res);

		expect(mockLogin).toHaveBeenCalledWith({
			email: "exampleuser1@hotmail.com",
			password: "password123",
		});
		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith({ token: "jwt-token" });
	});

	it("returns 401 for invalid credentials", async () => {
		mockLogin.mockRejectedValue(new InvalidCredentialsError());
		req = {
			body: { email: "exampleuser1@hotmail.com", password: "wrong" },
		} as Request;

		await controller.login(req, res);

		expect(mockStatus).toHaveBeenCalledWith(401);
		expect(mockJson).toHaveBeenCalledWith({ message: "Invalid email or password" });
	});

	it("returns 401 when user does not exist", async () => {
		mockLogin.mockRejectedValue(new UserNotFoundError());
		req = {
			body: { email: "missing@example.com", password: "password123" },
		} as Request;

		await controller.login(req, res);

		expect(mockStatus).toHaveBeenCalledWith(401);
		expect(mockJson).toHaveBeenCalledWith({ message: "Invalid email or password" });
	});

	it("returns 500 for unexpected errors", async () => {
		mockLogin.mockRejectedValue(new Error("JWT provider down"));
		req = {
			body: { email: "exampleuser1@hotmail.com", password: "password123" },
		} as Request;

		await controller.login(req, res);

		expect(mockStatus).toHaveBeenCalledWith(500);
		expect(mockJson).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});
