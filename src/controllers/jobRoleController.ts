
import type { Request, Response } from "express";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { JobRoleService } from "../services/jobRoleService.js";

export class JobRoleController {
    constructor(private readonly jobRoleService: JobRoleService) {}

    async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const jobRoles = await this.jobRoleService.findAllOpen();
            const response = jobRoles.map(JobRoleMapper.toResponse);
            res.status(200).json(response);
        } catch {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

