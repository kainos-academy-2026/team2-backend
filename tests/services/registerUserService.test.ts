import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserDao } from "../../src/daos/userDao.js";
import { DuplicateUserEmailError } from "../../src/errors/userErrors.js";
import { RegisterUserService } from "../../src/services/registerUserService.js";

describe("RegisterUserService.registerUser", () => {
	const mockCreateUser = vi.fn();
	const mockFindUserByEmail = vi.fn();
	const mockHash = vi.fn();
	let service: RegisterUserService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockUserDao = {
			createUser: mockCreateUser,
			findUserByEmail: mockFindUserByEmail,
		} as unknown as UserDao;

		service = new RegisterUserService(mockUserDao, { hash: mockHash });
	});

	it("creates a user with a hashed password", async () => {
		mockFindUserByEmail.mockResolvedValue(null);
		mockHash.mockResolvedValue("hashed-password");
		mockCreateUser.mockResolvedValue({});

		await service.registerUser({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "Strong!Pass9",
		});

		expect(mockHash).toHaveBeenCalledWith("Strong!Pass9");
		expect(mockCreateUser).toHaveBeenCalledWith({
			fullName: "Test User",
			email: "test.user@example.com",
			passwordHash: "hashed-password",
			role: "user",
		});
	});

	it("throws when a user with the same email already exists", async () => {
		mockFindUserByEmail.mockResolvedValue({ email: "test.user@example.com" });

		await expect(
			service.registerUser({
				fullName: "Test User",
				email: "test.user@example.com",
				password: "Strong!Pass9",
			}),
		).rejects.toBeInstanceOf(DuplicateUserEmailError);

		expect(mockHash).not.toHaveBeenCalled();
		expect(mockCreateUser).not.toHaveBeenCalled();
	});
});
