import type { Request, Response } from "express";
import {
	ApplicationAlreadyExistsError,
	JobRoleNotFoundError,
	JobRoleNotOpenForApplicationsError,
} from "../errors/jobApplicationErrors.js";
import { UserNotFoundError } from "../errors/userErrors.js";
import type { JobApplicationService } from "../services/jobApplicationService.js";

export class JobApplicationController {
	constructor(private readonly jobApplicationService: JobApplicationService) {}

	createCvUploadUrl = async (req: Request, res: Response): Promise<void> => {
		const { id: jobRoleId } = req.params as { id: string };

		try {
			const { userId, fileName, contentType } = req.body as {
				userId: number;
				fileName: string;
				contentType: "application/pdf";
			};
			const result = await this.jobApplicationService.createCvUploadUrl({
				jobRoleId,
				userId,
				fileName,
				contentType,
			});
			res.status(200).json(result);
		} catch (error: unknown) {
			if (
				error instanceof UserNotFoundError ||
				error instanceof JobRoleNotFoundError
			) {
				res.status(404).json({ message: error.message });
				return;
			}

			if (error instanceof JobRoleNotOpenForApplicationsError) {
				res.status(422).json({ message: error.message });
				return;
			}

			console.error("Create CV upload URL failed", { error });
			res.status(500).json({ message: "Internal server error" });
		}
	};

	applyForRole = async (req: Request, res: Response): Promise<void> => {
		const { id: jobRoleId } = req.params as { id: string };

		try {
			const { userId, cvKey } = req.body as { userId: number; cvKey: string };
			const result = await this.jobApplicationService.applyForRole({
				jobRoleId,
				userId,
				cvKey,
			});
			res.status(201).json(result);
		} catch (error: unknown) {
			if (
				error instanceof UserNotFoundError ||
				error instanceof JobRoleNotFoundError
			) {
				res.status(404).json({ message: error.message });
				return;
			}

			if (error instanceof JobRoleNotOpenForApplicationsError) {
				res.status(422).json({ message: error.message });
				return;
			}

			if (error instanceof ApplicationAlreadyExistsError) {
				res.status(409).json({ message: error.message });
				return;
			}

			console.error("Apply for role failed", { error });
			res.status(500).json({ message: "Internal server error" });
		}
	};
}
