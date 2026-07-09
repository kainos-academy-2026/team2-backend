import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const USER_ROLES = ["RECRUITMENT_ADMIN", "APPLICANT"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthenticatedUser {
	sub: string;
	role: UserRole;
}

function isUserRole(value: unknown): value is UserRole {
	return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

function getJwtSecret(): string | undefined {
	return process.env["JWT_SECRET"];
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.header("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}

	const token = authHeader.slice("Bearer ".length).trim();
	const jwtSecret = getJwtSecret();

	if (!jwtSecret) {
		res.status(500).json({ error: "Authentication is not configured" });
		return;
	}

	try {
		const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

		if (typeof decoded.sub !== "string" || !isUserRole(decoded.role)) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		req.user = {
			sub: decoded.sub,
			role: decoded.role,
		};

		next();
	} catch {
		res.status(401).json({ error: "Unauthorized" });
	}
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			res.status(403).json({ error: "Forbidden" });
			return;
		}

		next();
	};
}
