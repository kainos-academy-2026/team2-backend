export enum Role {
    User = "user",
}

export default interface User {
    fullName: string,
    email: string,
    passwordHash: string,
    role: Role
}