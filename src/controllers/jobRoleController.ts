import type { Request, Response } from "express";
import {
	JobRoleHasApplicationsError,
	JobRoleNotFoundError,
} from "../errors/jobApplicationErrors.js";
import type { JobRoleService } from "../services/jobRoleService.js";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getAll(_req: Request, res: Response): Promise<void> {
		const jobRoles = await this.jobRoleService.findAllOpen();
		res.status(200).json(jobRoles);
	}

	async getById(req: Request, res: Response): Promise<void> {
		const { id: jobRoleId } = req.params as { id: string };

		const jobRole = await this.jobRoleService.findById(jobRoleId);
		if (jobRole) {
			res.status(200).json(jobRole);
		} else {
			res.status(404).json({ message: "Job role not found" });
		}
	}

	async deleteRole(req: Request, res: Response): Promise<void> {
		const { id: jobRoleId } = req.params as { id: string };

		try {
			await this.jobRoleService.deleteRole(jobRoleId);
			res.status(204).send();
		} catch (error: unknown) {
			if (error instanceof JobRoleNotFoundError) {
				res.status(404).json({ message: "Job role not found" });
				return;
			}

			if (error instanceof JobRoleHasApplicationsError) {
				res.status(409).json({
					message: "Job role has existing applications and cannot be deleted",
				});
				return;
			}

			throw error;
		}
	}
}
