import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export interface CreateUserInput {
	fullName: string;
	email: string;
	passwordHash: string;
}

export class UserDao {
	async findByEmail(email: string): Promise<User | null> {
		return prisma.user.findUnique({ where: { email } });
	}

	async createUser(input: CreateUserInput): Promise<User> {
		return prisma.user.create({
			data: {
				fullName: input.fullName,
				email: input.email,
				passwordHash: input.passwordHash,
			},
		});
	}

	async deleteAllUsers(): Promise<void> {
		await prisma.user.deleteMany();
	}

	async findAllUsers(): Promise<User[]> {
		return prisma.user.findMany({ orderBy: { id: "asc" } });
	}
}