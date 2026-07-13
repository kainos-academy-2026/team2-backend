import { beforeEach, describe, expect, it, vi } from "vitest";
import Argon2PasswordHashingService from "../../src/services/argon2PasswordHashingService.js";

vi.mock("argon2", async () => ({
	default: {
		hash: vi.fn(),
		verify: vi.fn(),
	},
}));

import argon2 from "argon2";

describe("Argon2PasswordHashingService.hash", () => {
	let service: Argon2PasswordHashingService;

	beforeEach(() => {
		vi.resetAllMocks();
		service = new Argon2PasswordHashingService();
	});

	it("hashes a password using argon2", async () => {
		const hashedPassword = "$argon2id$v=19$m=65540,t=3,p=4$salt$hash";
		vi.mocked(argon2.hash).mockResolvedValue(hashedPassword);

		const result = await service.hash("MyPassword123!");

		expect(vi.mocked(argon2.hash)).toHaveBeenCalledWith("MyPassword123!");
		expect(result).toBe(hashedPassword);
	});

	it("propagates hashing errors", async () => {
		vi.mocked(argon2.hash).mockRejectedValue(new Error("hashing failed"));

		await expect(service.hash("password")).rejects.toThrow("hashing failed");
	});
});

describe("Argon2PasswordHashingService.compare", () => {
	let service: Argon2PasswordHashingService;

	beforeEach(() => {
		vi.resetAllMocks();
		service = new Argon2PasswordHashingService();
	});

	it("returns true when password matches hash", async () => {
		vi.mocked(argon2.verify).mockResolvedValue(true);

		const result = await service.compare(
			"password123",
			"$argon2id$v=19$m=65540,t=3,p=4$salt$hash",
		);

		expect(vi.mocked(argon2.verify)).toHaveBeenCalledWith(
			"$argon2id$v=19$m=65540,t=3,p=4$salt$hash",
			"password123",
		);
		expect(result).toBe(true);
	});

	it("returns false when password does not match hash", async () => {
		vi.mocked(argon2.verify).mockResolvedValue(false);

		const result = await service.compare(
			"wrongpassword",
			"$argon2id$v=19$m=65540,t=3,p=4$salt$hash",
		);

		expect(result).toBe(false);
	});

	it("propagates verification errors", async () => {
		vi.mocked(argon2.verify).mockRejectedValue(
			new Error("verification failed"),
		);

		await expect(
			service.compare("password", "$argon2id$v=19$m=65540,t=3,p=4$salt$hash"),
		).rejects.toThrow("verification failed");
	});
});
