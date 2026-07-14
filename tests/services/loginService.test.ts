import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserDao } from "../../src/daos/userDao.js";
import {
	InvalidCredentialsError,
	UserNotFoundError,
} from "../../src/errors/userErrors.js";
import type { PasswordHasher } from "../../src/interfaces/passwordHasher.js";
import type TokenService from "../../src/interfaces/tokenService.js";
import LoginService from "../../src/services/loginService.js";

describe("LoginService.login", () => {
	const mockFindUserByEmail = vi.fn();
	const mockCompare = vi.fn();
	const mockCreateToken = vi.fn();
	let service: LoginService;

	beforeEach(() => {
		vi.resetAllMocks();

		const userDao = {
			findUserByEmail: mockFindUserByEmail,
		} as unknown as UserDao;

		const passwordHasher = {
			compare: mockCompare,
			hash: vi.fn(),
		} as PasswordHasher;

		const tokenService = {
			create: mockCreateToken,
		} as TokenService;

		service = new LoginService(userDao, passwordHasher, tokenService);
	});

	it("normalizes email before lookup", async () => {
		mockFindUserByEmail.mockResolvedValue({
			id: 1,
			fullName: "Tim Cassells",
			email: "exampleuser1@hotmail.com",
			passwordHash: "hash",
			role: "USER",
		});
		mockCompare.mockResolvedValue(true);
		mockCreateToken.mockResolvedValue("jwt-token");

		await service.login({
			email: " ExampleUser1@Hotmail.com ",
			password: "password123",
		});

		expect(mockFindUserByEmail).toHaveBeenCalledWith(
			"exampleuser1@hotmail.com",
		);
	});

	it("returns token when credentials are valid", async () => {
		const user = {
			id: 1,
			fullName: "Tim Cassells",
			email: "exampleuser1@hotmail.com",
			passwordHash: "hash",
			role: "USER",
		};
		mockFindUserByEmail.mockResolvedValue(user);
		mockCompare.mockResolvedValue(true);
		mockCreateToken.mockResolvedValue("jwt-token");

		const result = await service.login({
			email: "exampleuser1@hotmail.com",
			password: "password123",
		});

		expect(mockCompare).toHaveBeenCalledWith("password123", "hash");
		expect(mockCreateToken).toHaveBeenCalledWith(user);
		expect(result).toEqual({ token: "jwt-token" });
	});

	it("throws when user is not found", async () => {
		mockFindUserByEmail.mockResolvedValue(null);

		await expect(
			service.login({ email: "missing@example.com", password: "password123" }),
		).rejects.toThrow(UserNotFoundError);

		expect(mockCompare).not.toHaveBeenCalled();
		expect(mockCreateToken).not.toHaveBeenCalled();
	});

	it("throws when password is invalid", async () => {
		mockFindUserByEmail.mockResolvedValue({
			id: 2,
			fullName: "Test User",
			email: "test@example.com",
			passwordHash: "hash",
			role: "USER",
		});
		mockCompare.mockResolvedValue(false);

		await expect(
			service.login({ email: "test@example.com", password: "wrong" }),
		).rejects.toThrow(InvalidCredentialsError);

		expect(mockCreateToken).not.toHaveBeenCalled();
	});
});
