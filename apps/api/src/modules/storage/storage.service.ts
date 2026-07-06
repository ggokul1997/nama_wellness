import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../../config/index.js';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
  ...(config.S3_ENDPOINT ? { endpoint: config.S3_ENDPOINT, forcePathStyle: true } : {}),
});

export type UploadPurpose = 'TEACHER_DOCUMENT' | 'COURSE_COVER' | 'LESSON_VIDEO' | 'LESSON_DOCUMENT' | 'STUDY_MATERIAL' | 'AVATAR';

export interface PresignRequest {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  purpose: UploadPurpose;
  userId: string;
}

export interface PresignResponse {
  uploadUrl: string;
  fileUrl: string; // The public URL to save to the database
  fileKey: string; // The S3 object key
}

// Validation rules per purpose
const UPLOAD_RULES: Record<UploadPurpose, { maxSizeBytes: number; allowedMimeTypes: string[] }> = {
  TEACHER_DOCUMENT: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  COURSE_COVER: {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  LESSON_VIDEO: {
    maxSizeBytes: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ['video/mp4', 'video/webm'],
  },
  LESSON_DOCUMENT: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf'],
  },
  STUDY_MATERIAL: {
    maxSizeBytes: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: ['application/pdf', 'application/zip', 'application/x-zip-compressed'],
  },
  AVATAR: {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png'],
  },
};

export class StorageError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'StorageError';
  }
}

export const storageService = {
  async getPresignedUrl(req: PresignRequest): Promise<PresignResponse> {
    const rules = UPLOAD_RULES[req.purpose];

    if (!rules) {
      throw new StorageError(`Invalid upload purpose: ${req.purpose}`);
    }

    if (req.fileSizeBytes > rules.maxSizeBytes) {
      throw new StorageError(`File size exceeds limit for ${req.purpose}. Max: ${rules.maxSizeBytes} bytes.`);
    }

    if (!rules.allowedMimeTypes.includes(req.mimeType)) {
      throw new StorageError(`Invalid file type for ${req.purpose}. Allowed: ${rules.allowedMimeTypes.join(', ')}`);
    }

    const extension = req.fileName.split('.').pop() || '';
    const uniqueId = crypto.randomUUID();
    const datePrefix = new Date().toISOString().split('T')[0];
    
    // Structure: bucket/purpose/YYYY-MM-DD/userId_uuid.ext
    const fileKey = `${req.purpose.toLowerCase()}/${datePrefix}/${req.userId}_${uniqueId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: config.S3_BUCKET_MEDIA,
      Key: fileKey,
      ContentType: req.mimeType,
      ContentLength: req.fileSizeBytes,
      // Metadata to identify who uploaded what
      Metadata: {
        'x-amz-meta-userid': req.userId,
        'x-amz-meta-purpose': req.purpose,
      },
    });

    try {
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      // Determine public file URL (for localstack it's endpoint/bucket/key)
      let fileUrl = '';
      if (config.S3_ENDPOINT) {
        fileUrl = `${config.S3_ENDPOINT}/${config.S3_BUCKET_MEDIA}/${fileKey}`;
      } else {
        fileUrl = `https://${config.S3_BUCKET_MEDIA}.s3.${config.AWS_REGION}.amazonaws.com/${fileKey}`;
      }

      return {
        uploadUrl,
        fileUrl,
        fileKey,
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new StorageError('Failed to generate secure upload URL', 500);
    }
  }
};
