export class BandNotFoundError extends Error {
	constructor() {
		super("Band not found");
		this.name = "BandNotFoundError";
	}
}

export class CapabilityNotFoundError extends Error {
	constructor() {
		super("Capability not found");
		this.name = "CapabilityNotFoundError";
	}
}
