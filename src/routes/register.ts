import { Router, type Request, type Response } from "express";

interface User {
    id: number;
    fullName: string;
    email: string;
    password: string;
    createdAt: Date;
}

const users: User[] = [];
let nextId = 1;

export const registerRouter = Router();

registerRouter.post("/register", (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        res.status(400).json({ message: "fullName, email, and password are required" });
        return;
    }

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
        res.status(409).json({ message: "Email already exists" });
        return;
    }

    const newUser: User = {
        id: nextId++,
        fullName,
        email,
        password,
        createdAt: new Date(),
    };

    users.push(newUser);

    res.status(201).json({ message: "Account created successfully" });
});
