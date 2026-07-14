import argon2 from "argon2";
import type { PasswordHasher } from "../interfaces/passwordHasher.js";

export default class Argon2PasswordHashingService implements PasswordHasher {
	async hash(password: string): Promise<string> {
		const hash = await argon2.hash(password);
		return hash;
	}

	async compare(password: string, hashedPassword: string): Promise<boolean> {
		return await argon2.verify(hashedPassword, password);
	}
}
