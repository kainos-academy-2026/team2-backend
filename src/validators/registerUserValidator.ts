import { z } from "zod";

const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

export const registerUserSchema = z.object({
	fullName: z.string().trim().min(1),
	email: z.string().trim().toLowerCase().email("Invalid email format"),
	password: z
		.string()
		.regex(
			PASSWORD_POLICY_REGEX,
			"Password must be at least 9 characters and include uppercase, lowercase, and a special character",
		),
});
