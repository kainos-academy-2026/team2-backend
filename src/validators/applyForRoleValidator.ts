import { z } from "zod";

export const applyForRoleSchema = z.object({
	userId: z.coerce.number().int().positive(),
	cvKey: z.string().min(1, "cvKey is required"),
});
