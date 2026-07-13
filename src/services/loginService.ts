import type { UserDao } from "../daos/userDao.js";
import type { LoginRequestDto } from "../dtos/loginRequestDto.js";
import type { LoginResponseDto } from "../dtos/loginResponseDto.js";
import {
	InvalidCredentialsError,
	UserNotFoundError,
} from "../errors/userErrors.js";
import type { PasswordHasher } from "../interfaces/passwordHasher.js";
import type TokenService from "../interfaces/tokenService.js";

export default class LoginService {
	constructor(
		private readonly userDao: UserDao,
		private readonly passwordHasher: PasswordHasher,
		private readonly tokenService: TokenService,
	) {}

	async login(loginRequest: LoginRequestDto): Promise<LoginResponseDto> {
		const normalizedEmail = loginRequest.email.trim().toLowerCase();
		const user = await this.userDao.findUserByEmail(normalizedEmail);
		if (!user) {
			throw new UserNotFoundError();
		}

		const isPasswordValid = await this.passwordHasher.compare(
			loginRequest.password,
			user.passwordHash,
		);
		if (!isPasswordValid) {
			throw new InvalidCredentialsError();
		}

		const token = await this.tokenService.create(user);
		return { token };
	}
}
