import type { PasswordHasher } from "../interfaces/passwordHasher.js";
import argon2 from "argon2";

export default class Argon2PasswordHashingService implements PasswordHasher {
    async hash(password: string): Promise<string> {
        const hash = await argon2.hash(password);
        return hash;
    }
}