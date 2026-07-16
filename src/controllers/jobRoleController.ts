import type { Request, Response } from "express";
import type { CreateJobRoleRequestDto } from "../dtos/createJobRoleRequestDto.js";
import { InvalidReferenceDataError } from "../errors/jobRoleErrors.js";
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
		const { id: jobRoleId } = req.params as { id: string };

		try {
			const jobRole = await this.jobRoleService.findById(jobRoleId);
			if (jobRole) {
				res.status(200).json(jobRole);
			} else {
				res.status(404).json({ message: "Job role not found" });
			}
		} catch {
			res.status(500).json({ message: "Internal server error" });
		}
	}

	async create(req: Request, res: Response): Promise<void> {
		try {
			const created = await this.jobRoleService.createJobRole(
				req.body as CreateJobRoleRequestDto,
			);
			res.status(201).json(created);
		} catch (error: unknown) {
			if (error instanceof InvalidReferenceDataError) {
				res.status(400).json({ message: "Invalid band or capability" });
				return;
			}

			res.status(500).json({ message: "Internal server error" });
		}
	}
}
