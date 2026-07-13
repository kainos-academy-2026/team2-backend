import type { Request, Response } from "express";
import type { JobRoleService } from "../services/jobRoleService.js";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getAll(_req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.findAllOpen();
			res.status(200).json(jobRoles);
		} catch {
			res.status(500).json({ message: "Internal server error" });
		}
	}

	async getById(req: Request, res: Response): Promise<void> {
		const jobRoleId = req.params.id;
		if (!jobRoleId) {
			res.status(400).json({ message: "Job role ID is required" });
			return;
		}

		try {
			const jobRole = await this.jobRoleService.findById(jobRoleId as string);
			if (jobRole) {
				res.status(200).json(jobRole);
			} else {
				res.status(404).json({ message: "Job role not found" });
			}
		} catch {
			res.status(500).json({ message: "Internal server error" });
		}
	}
}
