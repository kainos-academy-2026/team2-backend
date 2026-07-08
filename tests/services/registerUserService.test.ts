import { beforeEach, describe, expect, it, vi } from "vitest";
import { DuplicateUserEmailError } from "../../src/errors/userErrors.js";
import { RegisterUserService } from "../../src/services/registerUserService.js";
import type { UserDao } from "../../src/daos/userDao.js";

describe("RegisterUserService.registerUser", () => {
	const mockCreateUser = vi.fn();
	const mockHash = vi.fn();
	let service: RegisterUserService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockUserDao = {
			createUser: mockCreateUser,
		} as unknown as UserDao;

		service = new RegisterUserService(mockUserDao, { hash: mockHash });
	});

	it("creates a user with a hashed password", async () => {
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
		});
	});

	it("throws when the database reports a duplicate email", async () => {
		mockHash.mockResolvedValue("hashed-password");
		mockCreateUser.mockRejectedValue({ code: "P2002" });

		await expect(
			service.registerUser({
				fullName: "Test User",
				email: "test.user@example.com",
				password: "Strong!Pass9",
			}),
		).rejects.toBeInstanceOf(DuplicateUserEmailError);

		expect(mockHash).toHaveBeenCalledWith("Strong!Pass9");
		expect(mockCreateUser).toHaveBeenCalledWith({
			fullName: "Test User",
			email: "test.user@example.com",
			passwordHash: "hashed-password",
		});
	});
});