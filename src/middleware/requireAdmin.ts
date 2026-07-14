import type { NextFunction, Request, Response } from "express";
import * as jose from "jose";

export const requireAdmin = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}

	const token = authHeader.slice(7);
	const secretKey = process.env.JWT_SECRET_KEY;

	if (!secretKey) {
		res.status(500).json({ message: "Internal server error" });
		return;
	}

	try {
		const { payload } = await jose.jwtVerify(
			token,
			new TextEncoder().encode(secretKey),
		);

		if ((payload.role as string)?.toLowerCase() !== "admin") {
			res.status(403).json({ message: "Forbidden" });
			return;
		}

		next();
	} catch {
		res.status(401).json({ message: "Unauthorized" });
	}
};
