import type { User } from "@prisma/client";
import type TokenService from "../interfaces/tokenService.js";
import * as jose from 'jose'

export default class JoseTokenService implements TokenService {
    private readonly secretKey: Uint8Array;

    constructor() {
        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error("JWT_SECRET_KEY is not defined in the environment variables");
        }

        this.secretKey = new TextEncoder().encode(secretKey);
    }

    async create(user: User): Promise<string> {
        const payload = {
            sub: user.id.toString(),
            name: user.fullName,
            email: user.email,
            role: user.role
        }

        const token = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('2h')
            .sign(this.secretKey);

        return token;
    }
}