import { apiFetch } from './client';

export type UploadPurpose = 'TEACHER_DOCUMENT' | 'COURSE_COVER' | 'LESSON_VIDEO' | 'LESSON_DOCUMENT' | 'STUDY_MATERIAL' | 'AVATAR';

export interface PresignRequest {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  purpose: UploadPurpose;
}

export interface PresignResponse {
  uploadUrl: string;
  fileUrl: string;
  fileKey: string;
}

export const storageApi = {
  /**
   * Gets a presigned URL from the backend and then uploads the file directly to S3/LocalStack.
   * Returns the final public URL and the S3 file key.
   */
  async uploadFile(file: File, purpose: UploadPurpose, onProgress?: (progress: number) => void): Promise<{ fileUrl: string; fileKey: string }> {
    // 1. Get presigned URL
    const presignReq: PresignRequest = {
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      purpose,
    };
    
    const res = await apiFetch<PresignResponse>('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify(presignReq),
    });
    
    if (!res.data) {
      throw new Error('Failed to get upload credentials');
    }

    const { uploadUrl, fileUrl, fileKey } = res.data;

    // 2. Upload directly to S3 using XHR to track progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ fileUrl, fileKey });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.onabort = () => reject(new Error('Upload aborted'));

      xhr.open('PUT', uploadUrl, true);
      // S3 requires the exact Content-Type that was signed
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }
};
