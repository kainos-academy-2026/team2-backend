import { z } from "zod";

export const applyForRoleSchema = z.object({
	userId: z.coerce.number().int().positive(),
});
