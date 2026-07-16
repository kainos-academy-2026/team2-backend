import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateParams =
	(schema: ZodType): RequestHandler =>
	(req, res, next): void => {
		const parsedRequest = schema.safeParse(req.params ?? {});

		if (!parsedRequest.success) {
			const firstIssue =
				parsedRequest.error.issues[0]?.message ?? "Invalid request parameters";
			res.status(400).json({ message: firstIssue });
			return;
		}

		req.params = parsedRequest.data as typeof req.params;

		next();
	};
