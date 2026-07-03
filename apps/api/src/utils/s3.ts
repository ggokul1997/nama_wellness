import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// This configuration targets the LocalStack instance running in docker-compose.
const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'nama-wellness-uploads';

export const s3Utils = {
  /**
   * Generates a presigned URL that the client can use to upload a file directly to S3.
   */
  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 3600
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ChecksumAlgorithm: undefined,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    // The public URL to access the file after upload (assuming public-read or accessible via CF)
    const fileUrl = `${process.env.AWS_ENDPOINT_URL || 'http://localhost:4566'}/${BUCKET_NAME}/${key}`;

    return { uploadUrl, fileUrl, key };
  },

  /**
   * Generates a presigned URL that the client can use to securely view/download a file.
   */
  async generatePresignedGetUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  },

  /**
   * Helper to convert an absolute S3 fileUrl back to a signed URL for viewing.
   */
  async signDocumentUrl(fileUrl: string, expiresInSeconds = 3600): Promise<string> {
    const bucketPrefix = `${process.env.AWS_ENDPOINT_URL || 'http://localhost:4566'}/${BUCKET_NAME}/`;
    if (!fileUrl.startsWith(bucketPrefix)) return fileUrl;
    const key = fileUrl.replace(bucketPrefix, '');
    return this.generatePresignedGetUrl(key, expiresInSeconds);
  }
};
