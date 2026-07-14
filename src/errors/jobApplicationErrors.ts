export class JobRoleNotOpenForApplicationsError extends Error {
	constructor() {
		super("Job role is not open for applications");
		this.name = "JobRoleNotOpenForApplicationsError";
	}
}

export class ApplicationAlreadyExistsError extends Error {
	constructor() {
		super("Application already exists for this role");
		this.name = "ApplicationAlreadyExistsError";
	}
}
