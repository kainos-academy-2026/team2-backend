import type { Request, Response } from "express";
import {
	ApplicationAlreadyExistsError,
	JobRoleNotOpenForApplicationsError,
} from "../errors/jobApplicationErrors.js";
import { UserNotFoundError } from "../errors/userErrors.js";
import type { JobApplicationService } from "../services/jobApplicationService.js";

export class JobApplicationController {
	constructor(private readonly jobApplicationService: JobApplicationService) {}

	applyForRole = async (req: Request, res: Response): Promise<void> => {
		const jobRoleId = Array.isArray(req.params.id)
			? req.params.id[0]
			: req.params.id;
		const file = (
			req as Request & {
				file?: Parameters<JobApplicationService["applyForRole"]>[0]["file"];
			}
		).file;

		if (!jobRoleId) {
			res.status(400).json({ message: "Job role ID is required" });
			return;
		}

		if (!file) {
			res.status(400).json({ message: "CV file is required" });
			return;
		}

		try {
			const { userId } = req.body as { userId: number };
			const result = await this.jobApplicationService.applyForRole({
				jobRoleId,
				userId,
				file,
			});
			res.status(201).json(result);
		} catch (error: unknown) {
			if (
				error instanceof UserNotFoundError ||
				(error instanceof Error && error.message === "Job role not found")
			) {
				res.status(404).json({ message: error.message });
				return;
			}

			if (
				error instanceof JobRoleNotOpenForApplicationsError ||
				error instanceof ApplicationAlreadyExistsError
			) {
				res.status(409).json({ message: error.message });
				return;
			}

			console.error("Apply for role failed", { error });
			res.status(500).json({ message: "Internal server error" });
		}
	};
}
