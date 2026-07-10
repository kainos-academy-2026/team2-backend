import type { User as PrismaUser } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type User from "../models/user.js";

export class UserDao {
	async createUser(input: User): Promise<PrismaUser> {
		return prisma.user.create({
			data: input,
		});
	}

	async findUserByEmail(email: string): Promise<PrismaUser | null> {
		return prisma.user.findUnique({
			where: { email },
		});
	}
}
