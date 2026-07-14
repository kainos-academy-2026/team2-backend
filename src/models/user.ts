export enum Role {
	User = "user",
	Admin = "admin",
}

export default interface User {
	fullName: string;
	email: string;
	passwordHash: string;
	role: Role;
}
