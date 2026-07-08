export class DuplicateUserEmailError extends Error {
	constructor() {
		super("Email already exists");
		this.name = "DuplicateUserEmailError";
	}
}