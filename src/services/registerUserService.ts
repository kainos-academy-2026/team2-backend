import argon2 from "argon2";
import { DuplicateUserEmailError } from "../errors/userErrors.js";
import type { CreateUserInput, UserDao } from "../daos/userDao.js";

export interface PasswordHasher {
	hash(password: string): Promise<string>;
}

export interface RegisterUserInput {
	fullName: string;
	email: string;
	password: string;
}

const isUniqueConstraintError = (error: unknown): boolean => {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: string }).code === "P2002"
	);
};

export class RegisterUserService {
	constructor(
		private readonly userDao: UserDao,
		private readonly passwordHasher: PasswordHasher = argon2,
	) {}

	async registerUser(input: RegisterUserInput): Promise<void> {
		const existingUser = await this.userDao.findByEmail(input.email);

		if (existingUser) {
			throw new DuplicateUserEmailError();
		}

		const passwordHash = await this.passwordHasher.hash(input.password);

		const userToCreate: CreateUserInput = {
			fullName: input.fullName,
			email: input.email,
			passwordHash,
		};

		try {
			await this.userDao.createUser(userToCreate);
		} catch (error: unknown) {
			if (isUniqueConstraintError(error)) {
				throw new DuplicateUserEmailError();
			}

			throw error;
		}
	}
}