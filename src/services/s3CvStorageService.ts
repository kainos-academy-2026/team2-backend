import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type CvStorage from "../interfaces/cvStorage.js";
import type { CvUploadInput } from "../interfaces/cvStorage.js";

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

	async uploadCv(input: CvUploadInput): Promise<string> {
		if (!this.bucketName) {
			throw new Error("CV_S3_BUCKET must be set");
		}

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: input.key,
				Body: input.content,
				ContentType: input.contentType,
			}),
		);

		return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${input.key}`;
	}
}
