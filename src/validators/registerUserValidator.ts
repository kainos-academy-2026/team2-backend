import { z } from "zod";

const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

export const registerUserSchema = z.object({
	fullName: z.string().trim().min(1),
	email: z.string().trim().toLowerCase().email("Invalid email format"),
	password: z
		.string()
		.min(
			9,
			"Password must be at least 9 characters and include uppercase, lowercase, and a special character",
		)
		.regex(
			PASSWORD_POLICY_REGEX,
			"Password must be at least 9 characters and include uppercase, lowercase, and a special character",
		),
});

const requiredMessage = "fullName, email, and password are required";

export const getRegisterUserValidationMessage = (error: z.ZodError): string => {
	const issue = error.issues[0];

	if (!issue) {
		return requiredMessage;
	}

	if (issue.path[0] === "email" && issue.code === "invalid_format") {
		return "Invalid email format";
	}

	if (issue.path[0] === "password") {
		return "Password must be at least 9 characters and include uppercase, lowercase, and a special character";
	}

	return requiredMessage;
};