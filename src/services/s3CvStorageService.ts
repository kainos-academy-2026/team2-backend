import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
	CvUploadUrlInputDto,
	CvUploadUrlResponseDto,
} from "../dtos/cvUploadUrlDto.js";
import type CvStorage from "../interfaces/cvStorage.js";

export default class S3CvStorageService implements CvStorage {
	private readonly s3Client: S3Client;
	private readonly bucketName: string;
	private readonly region: string;

	constructor(
		s3Client = new S3Client({ region: process.env.AWS_REGION ?? "eu-west-1" }),
		bucketName = process.env.CV_S3_BUCKET,
		region = process.env.AWS_REGION ?? "eu-west-1",
	) {
		this.s3Client = s3Client;
		this.bucketName = bucketName ?? "";
		this.region = region;
	}

	async createCvUploadUrl(
		input: CvUploadUrlInputDto,
	): Promise<CvUploadUrlResponseDto> {
		if (!this.bucketName) {
			throw new Error("CV_S3_BUCKET must be set");
		}

		const uploadUrl = await getSignedUrl(
			this.s3Client,
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: input.key,
				ContentType: input.contentType,
			}),
			{ expiresIn: 900 },
		);

		return {
			cvKey: input.key,
			uploadUrl,
		};
	}

	getCvUrl(cvKey: string): string {
		return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${cvKey}`;
	}
}
