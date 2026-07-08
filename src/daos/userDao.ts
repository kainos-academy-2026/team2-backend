import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateUserInput } from "../interfaces/createUserInput.js";

export class UserDao {
	async createUser(input: CreateUserInput): Promise<User> {
		return prisma.user.create({
			data: {
				fullName: input.fullName,
				email: input.email,
				passwordHash: input.passwordHash,
			},
		});
	}
}