import type { NextFunction, Request, Response } from "express";
import type { JWTPayload } from "jose";
import type TokenService from "../interfaces/tokenService.js";
import { Role } from "../models/user.js";

type AuthenticatedRole = Role.User | Role.Admin;

type AuthenticatedUser = {
	userId: string;
	email: string;
	name: string;
	role: AuthenticatedRole;
};

type AuthenticatedLocals = {
	authUser?: AuthenticatedUser;
};

const isString = (value: unknown): value is string => typeof value === "string";

const normalizeRole = (value: string): AuthenticatedRole | null => {
	const role = value.trim().toLowerCase();
	if (role === Role.User) {
		return Role.User;
	}

	if (role === Role.Admin) {
		return Role.Admin;
	}

	return null;
};

const parsePayloadToUser = (payload: JWTPayload): AuthenticatedUser | null => {
	if (!isString(payload.sub)) {
		return null;
	}

	const roleValue = payload.role;
	if (!isString(roleValue)) {
		return null;
	}

	const role = normalizeRole(roleValue);
	if (!role) {
		return null;
	}

	const email = isString(payload.email) ? payload.email : "";
	const name = isString(payload.name) ? payload.name : "";

	return {
		userId: payload.sub,
		email,
		name,
		role,
	};
};

const getBearerToken = (
	authorizationHeader: string | undefined,
): string | null => {
	if (!authorizationHeader) {
		return null;
	}

	const [scheme, token] = authorizationHeader.split(" ");
	if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
		return null;
	}

	return token;
};

export const authenticateRequest = (tokenService: TokenService) => {
	return async (
		req: Request,
		res: Response<unknown, AuthenticatedLocals>,
		next: NextFunction,
	): Promise<void> => {
		const token = getBearerToken(req.header("authorization"));
		if (!token) {
			res.redirect(302, "/login");
			return;
		}

		try {
			const payload = await tokenService.verify(token);
			const authUser = parsePayloadToUser(payload);
			if (!authUser) {
				res.redirect(302, "/login");
				return;
			}

			res.locals.authUser = authUser;
			next();
		} catch {
			res.redirect(302, "/login");
		}
	};
};

export const requireAnyRole = (allowedRoles: AuthenticatedRole[]) => {
	return (
		_req: Request,
		res: Response<unknown, AuthenticatedLocals>,
		next: NextFunction,
	): void => {
		const role = res.locals.authUser?.role;
		if (!role || !allowedRoles.includes(role)) {
			res.status(403).json({ message: "Forbidden" });
			return;
		}

		next();
	};
};

export const requireAdmin = requireAnyRole([Role.Admin]);
