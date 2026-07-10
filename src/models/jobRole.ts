
export interface JobRole {
	jobRoleId: number;
	roleName: string;
	location: string;
	closingDate: Date;
	status: string;
	description: string;
	responsibilities: string[];
	sharepointUrl: string;
	numberOfOpenPositions: number;
	capability: {
		capabilityName: string;
	};
	band: {
		bandName: string;
	};
}

