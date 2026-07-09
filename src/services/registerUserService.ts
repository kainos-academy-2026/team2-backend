import { DuplicateUserEmailError } from "../errors/userErrors.js";
import type { CreateUserInput } from "../interfaces/createUserInput.js";
import type { PasswordHasher } from "../interfaces/passwordHasher.js";
import type { RegisterUserInput } from "../interfaces/registerUserInput.js";
import type { UserDao } from "../daos/userDao.js";
import Argon2PasswordHashingService from "./argon2PasswordHashingService.js";

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
		private readonly passwordHasher: PasswordHasher = new Argon2PasswordHashingService(),
	) {}

	async registerUser(input: RegisterUserInput): Promise<void> {
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