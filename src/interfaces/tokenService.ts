import type { User } from "@prisma/client";
import type { JWTPayload } from "jose";

export default interface TokenService {
	create(user: User): Promise<string>;
	verify(token: string): Promise<JWTPayload>;
}
