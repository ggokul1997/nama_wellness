import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// This configuration targets the LocalStack instance running in docker-compose.
// Use the same env var names as defined in apps/api/.env
const S3_ENDPOINT = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL || 'http://localhost:4566';
const BUCKET_NAME = process.env.S3_BUCKET_MEDIA || process.env.AWS_S3_BUCKET_NAME || 'nama-media';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

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

    // The public URL to access the file after upload
    let fileUrl = `${S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
    
    // If using Supabase S3, the public URL must use /object/public/ instead of the /s3/ endpoint
    if (S3_ENDPOINT.includes('.supabase.co') && S3_ENDPOINT.includes('/storage/v1/s3')) {
      const publicEndpoint = S3_ENDPOINT.replace(/\/storage\/v1\/s3\/?$/, '/storage/v1/object/public');
      fileUrl = `${publicEndpoint}/${BUCKET_NAME}/${key}`;
    }

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
   * Safely extracts the S3 key from any generated fileUrl, regardless of whether 
   * it uses the standard S3 endpoint or the Supabase public object endpoint.
   */
  extractKeyFromUrl(fileUrl: string): string | null {
    // Standard S3 format: {S3_ENDPOINT}/{BUCKET_NAME}/key
    const standardPrefix = `${S3_ENDPOINT}/${BUCKET_NAME}/`;
    if (fileUrl.startsWith(standardPrefix)) {
      return fileUrl.substring(standardPrefix.length);
    }
    
    // Supabase Public format: {PUBLIC_ENDPOINT}/{BUCKET_NAME}/key
    if (S3_ENDPOINT.includes('.supabase.co') && S3_ENDPOINT.includes('/storage/v1/s3')) {
      const publicEndpoint = S3_ENDPOINT.replace(/\/storage\/v1\/s3\/?$/, '/storage/v1/object/public');
      const supabasePrefix = `${publicEndpoint}/${BUCKET_NAME}/`;
      if (fileUrl.startsWith(supabasePrefix)) {
        return fileUrl.substring(supabasePrefix.length);
      }
    }
    
    return null;
  },

  /**
   * Helper to convert an absolute S3 fileUrl back to a signed URL for viewing.
   */
  async signDocumentUrl(fileUrl: string, expiresInSeconds = 3600): Promise<string> {
    const key = this.extractKeyFromUrl(fileUrl);
    if (!key) return fileUrl;
    return this.generatePresignedGetUrl(key, expiresInSeconds);
  },

  /**
   * Streams a file from S3 directly to the Express response, supporting HTTP Range requests.
   */
  async streamObject(fileUrl: string, rangeHeader: string | undefined, res: any): Promise<void> {
    const key = this.extractKeyFromUrl(fileUrl);
    if (!key) {
      res.status(404).send('File not found or not in S3');
      return;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Range: rangeHeader,
      });

      const response = await s3Client.send(command);

      // Set headers from S3 response
      if (response.ContentType) res.setHeader('Content-Type', response.ContentType);
      if (response.ContentLength) res.setHeader('Content-Length', response.ContentLength.toString());
      if (response.ContentRange) res.setHeader('Content-Range', response.ContentRange);
      if (response.AcceptRanges) res.setHeader('Accept-Ranges', response.AcceptRanges);
      
      // S3 returns 206 if Range was provided and valid, 200 otherwise
      res.status(response.$metadata.httpStatusCode || 200);

      // Pipe the stream to the response
      if (response.Body) {
        // In Node.js environment, response.Body is an IncomingMessage or Readable
        (response.Body as any).pipe(res);
      } else {
        res.status(404).send('Empty body');
      }
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        res.status(404).send('Video not found');
      } else {
        console.error('S3 stream error:', error);
        res.status(500).send('Error streaming video');
      }
    }
  }
};
