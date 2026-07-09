import { DuplicateUserEmailError } from "../errors/userErrors.js";
import type { CreateUserInput } from "../interfaces/createUserInput.js";
import type { PasswordHasher } from "../interfaces/passwordHasher.js";
import type { UserDao } from "../daos/userDao.js";
import Argon2PasswordHashingService from "./argon2PasswordHashingService.js";
import { Role } from "../models/user.js";

export class RegisterUserService {
	constructor(
		private readonly userDao: UserDao,
		private readonly passwordHasher: PasswordHasher,
	) {}

	async registerUser(input: CreateUserInput): Promise<void> {

		const userExists = await this.userDao.findUserByEmail(input.email);
		if (userExists) {
			throw new DuplicateUserEmailError();
		}

		const passwordHash = await this.passwordHasher.hash(input.password);

		await this.userDao.createUser({
			fullName: input.fullName,
			email: input.email,
			passwordHash: passwordHash,
			role: Role.User,
		});
	}
}