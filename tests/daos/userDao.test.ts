import type { User as PrismaUser } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserDao } from "../../src/daos/userDao.js";
import { Role } from "../../src/models/user.js";

vi.mock("../../src/lib/prisma.js", () => ({
	prisma: {
		user: {
			create: vi.fn(),
			findUnique: vi.fn(),
		},
	},
}));

import { prisma } from "../../src/lib/prisma.js";

describe("UserDao.createUser", () => {
	let dao: UserDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new UserDao();
	});

	it("creates a user with provided data", async () => {
		const createdUser = {
			id: 1,
			email: "test.user@example.com",
			passwordHash: "hashed-password",
			fullName: "Test User",
			role: "user",
		} as PrismaUser;
		vi.mocked(prisma.user.create).mockResolvedValue(createdUser);

		const input = {
			email: "test.user@example.com",
			passwordHash: "hashed-password",
			fullName: "Test User",
			role: Role.User,
		};

		const result = await dao.createUser(input);

		expect(vi.mocked(prisma.user.create)).toHaveBeenCalledWith({
			data: input,
		});
		expect(result).toEqual(createdUser);
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.user.create).mockRejectedValue(
			new Error("unique constraint violation"),
		);

		await expect(
			dao.createUser({
				email: "duplicate@example.com",
				passwordHash: "hashed",
				fullName: "User",
				role: Role.User,
			}),
		).rejects.toThrow("unique constraint violation");
	});
});

describe("UserDao.findUserByEmail", () => {
	let dao: UserDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new UserDao();
	});

	it("returns a user by email", async () => {
		const user = {
			id: 2,
			email: "existing@example.com",
			passwordHash: "hashed-password",
			fullName: "Existing User",
			role: "user",
		} as PrismaUser;
		vi.mocked(prisma.user.findUnique).mockResolvedValue(user);

		const result = await dao.findUserByEmail("existing@example.com");

		expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
			where: { email: "existing@example.com" },
		});
		expect(result).toEqual(user);
	});

	it("returns null when user does not exist", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

		const result = await dao.findUserByEmail("nonexistent@example.com");

		expect(result).toBeNull();
	});

	it("propagates database errors", async () => {
		vi.mocked(prisma.user.findUnique).mockRejectedValue(
			new Error("db connection lost"),
		);

		await expect(dao.findUserByEmail("any@example.com")).rejects.toThrow(
			"db connection lost",
		);
	});
});
