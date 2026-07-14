import { PutObjectCommand } from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import S3CvStorageService from "../../src/services/s3CvStorageService.js";

const mockGetSignedUrl = vi.fn();

vi.mock("@aws-sdk/s3-request-presigner", () => ({
	getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

describe("S3CvStorageService", () => {
	const mockSend = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("createCvUploadUrl", () => {
		it("returns a presigned upload URL", async () => {
			mockGetSignedUrl.mockResolvedValue("https://signed.example.com/upload");
			const service = new S3CvStorageService(
				{ send: mockSend } as never,
				"test-bucket",
				"eu-west-1",
			);

			const result = await service.createCvUploadUrl({
				key: "cvs/role1/user2/cv.pdf",
				contentType: "application/pdf",
			});

			expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
			const [, command] = mockGetSignedUrl.mock.calls[0] as [unknown, unknown];
			expect(command).toBeInstanceOf(PutObjectCommand);
			expect(result).toEqual({
				cvKey: "cvs/role1/user2/cv.pdf",
				uploadUrl: "https://signed.example.com/upload",
			});
		});

		it("throws when bucket is not configured", async () => {
			const service = new S3CvStorageService(
				{ send: mockSend } as never,
				"",
				"eu-west-1",
			);

			await expect(
				service.createCvUploadUrl({
					key: "cvs/role1/user2/cv.pdf",
					contentType: "application/pdf",
				}),
			).rejects.toThrow("CV_S3_BUCKET must be set");
		});
	});

	describe("getCvUrl", () => {
		it("returns the public URL for an uploaded cv key", () => {
			const service = new S3CvStorageService(
				{ send: mockSend } as never,
				"test-bucket",
				"eu-west-1",
			);

			expect(service.getCvUrl("cvs/role1/user2/cv.pdf")).toBe(
				"https://test-bucket.s3.eu-west-1.amazonaws.com/cvs/role1/user2/cv.pdf",
			);
		});
	});
});
