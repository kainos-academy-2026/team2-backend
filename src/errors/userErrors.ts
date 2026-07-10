export class DuplicateUserEmailError extends Error {
	constructor() {
		super("Email already exists");
		this.name = "DuplicateUserEmailError";
	}
}

export class UserNotFoundError extends Error {
	constructor() {
		super("User not found");
		this.name = "UserNotFoundError";
	}
}

export class InvalidCredentialsError extends Error {
	constructor() {
		super("Invalid credentials");
		this.name = "InvalidCredentialsError";
	}
}
