import type { User } from "@prisma/client";

export default interface TokenService {
	create(user: User): Promise<string>;
}
