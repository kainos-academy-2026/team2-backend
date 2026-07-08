import { beforeEach, describe, expect, it, vi } from "vitest";
import { DuplicateUserEmailError } from "../../src/errors/userErrors.js";
import { RegisterUserService } from "../../src/services/registerUserService.js";
import type { UserDao } from "../../src/daos/userDao.js";

describe("RegisterUserService.registerUser", () => {
	const mockFindByEmail = vi.fn();
	const mockCreateUser = vi.fn();
	const mockHash = vi.fn();
	let service: RegisterUserService;

	beforeEach(() => {
		vi.resetAllMocks();
		const mockUserDao = {
			findByEmail: mockFindByEmail,
			createUser: mockCreateUser,
		} as unknown as UserDao;

		service = new RegisterUserService(mockUserDao, { hash: mockHash });
	});

	it("creates a user with a hashed password", async () => {
		mockFindByEmail.mockResolvedValue(null);
		mockHash.mockResolvedValue("hashed-password");
		mockCreateUser.mockResolvedValue({});

		await service.registerUser({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "Strong!Pass9",
		});

		expect(mockFindByEmail).toHaveBeenCalledWith("test.user@example.com");
		expect(mockHash).toHaveBeenCalledWith("Strong!Pass9");
		expect(mockCreateUser).toHaveBeenCalledWith({
			fullName: "Test User",
			email: "test.user@example.com",
			passwordHash: "hashed-password",
		});
	});

	it("throws when the email already exists", async () => {
		mockFindByEmail.mockResolvedValue({ id: 1 });

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