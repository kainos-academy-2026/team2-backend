import { PutObjectCommand } from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import S3CvStorageService from "../../src/services/s3CvStorageService.js";

describe("S3CvStorageService.uploadCv", () => {
	const mockSend = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("uploads a file and returns a public URL", async () => {
		mockSend.mockResolvedValue({});
		const service = new S3CvStorageService(
			{ send: mockSend } as never,
			"test-bucket",
			"eu-west-1",
		);

		const result = await service.uploadCv({
			key: "cvs/role1/user2/cv.pdf",
			content: Buffer.from("pdf"),
			contentType: "application/pdf",
		});

		expect(mockSend).toHaveBeenCalledTimes(1);
		expect(mockSend.mock.calls[0]?.[0]).toBeInstanceOf(PutObjectCommand);
		expect(result).toBe(
			"https://test-bucket.s3.eu-west-1.amazonaws.com/cvs/role1/user2/cv.pdf",
		);
	});

	it("throws when bucket is not configured", async () => {
		const service = new S3CvStorageService(
			{ send: mockSend } as never,
			"",
			"eu-west-1",
		);

		await expect(
			service.uploadCv({
				key: "cvs/role1/user2/cv.pdf",
				content: Buffer.from("pdf"),
				contentType: "application/pdf",
			}),
		).rejects.toThrow("CV_S3_BUCKET must be set");
	});
});
