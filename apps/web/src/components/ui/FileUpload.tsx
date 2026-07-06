'use client';

import React, { useState, useRef } from 'react';
import { storageApi, type UploadPurpose } from '@/lib/api/storage';
import { getErrorMessage } from '@/lib/error';

interface FileUploadProps {
  purpose?: UploadPurpose;
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadSuccess: (fileUrl: string, fileName: string, fileSizeBytes: number, mimeType: string) => void;
  className?: string;
  customUploadFn?: (file: File) => Promise<{ fileUrl: string; fileKey?: string }>;
}

export function FileUpload({ purpose, label, accept, maxSizeMB = 5, onUploadSuccess, className = '', customUploadFn }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!purpose && !customUploadFn) {
      setError('Either purpose or customUploadFn must be provided');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      if (customUploadFn) {
        const { fileUrl } = await customUploadFn(file);
        onUploadSuccess(fileUrl, file.name, file.size, file.type);
      } else {
        const { fileUrl } = await storageApi.uploadFile(file, purpose!, (p) => setProgress(p));
        onUploadSuccess(fileUrl, file.name, file.size, file.type);
      }
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`file-upload-container ${className}`} style={{ marginBottom: '1rem' }}>
      <label className="label">{label}</label>
      
      <div style={{
        border: '2px dashed var(--surface-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.02)',
        position: 'relative',
        transition: 'border-color 0.2s',
      }}>
        {uploading ? (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--brand-400)' }}>
              Uploading... {progress}%
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--surface-bg)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gradient-brand)', transition: 'width 0.2s' }} />
            </div>
          </div>
        ) : (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={accept}
              disabled={uploading}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer'
              }}
            />
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>📄</div>
            {file ? (
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem', position: 'relative', zIndex: 10 }}
                  onClick={handleUpload}
                >
                  Upload File
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Click or drag file to upload</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Max size: {maxSizeMB}MB</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
}
