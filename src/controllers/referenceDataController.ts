import type { Request, Response } from "express";
import type { JobRoleService } from "../services/jobRoleService.js";

export class ReferenceDataController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getBands(_req: Request, res: Response): Promise<void> {
		try {
			const bands = await this.jobRoleService.getBands();
			res.status(200).json(bands);
		} catch {
			res.status(500).json({ message: "Internal server error" });
		}
	}

	async getCapabilities(_req: Request, res: Response): Promise<void> {
		try {
			const capabilities = await this.jobRoleService.getCapabilities();
			res.status(200).json(capabilities);
		} catch {
			res.status(500).json({ message: "Internal server error" });
		}
	}
}
