import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateBody =
	(schema: ZodType): RequestHandler =>
	(req, res, next): void => {
		const parsedRequest = schema.safeParse(req.body ?? {});

		if (!parsedRequest.success) {
			const firstIssue =
				parsedRequest.error.issues[0]?.message ?? "Invalid request body";
			res.status(400).json({ message: firstIssue });
			return;
		}

		req.body = parsedRequest.data;
		next();
	};
