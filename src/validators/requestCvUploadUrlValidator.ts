import { z } from "zod";

export const requestCvUploadUrlSchema = z.object({
	userId: z.coerce.number().int().positive(),
	fileName: z.string().min(1, "fileName is required"),
	contentType: z.string().min(1, "contentType is required"),
});
