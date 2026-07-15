export class InvalidReferenceDataError extends Error {
	constructor() {
		super("Invalid band or capability");
		this.name = "InvalidReferenceDataError";
	}
}
