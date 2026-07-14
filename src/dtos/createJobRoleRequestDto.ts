export interface CreateJobRoleRequestDto {
	name: string;
	location: string;
	capability: string;
	band: string;
	closingDate: string;
	description?: string;
	sharepointUrl?: string;
	responsibilities?: string[];
	numberOfOpenPositions?: number;
}
