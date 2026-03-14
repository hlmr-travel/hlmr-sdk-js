/**
 * Types for files-api (file upload, management, RGPD lifecycle)
 */

export type FileType = 'passport' | 'avatar';

export type FileVisibility = 'sensitive' | 'private' | 'public';

export type FileStatus =
  | 'pending_upload'
  | 'uploaded'
  | 'verified'
  | 'rejected'
  | 'deleted';

export interface FileUploadOptions {
  file_type: FileType;
  content_type: string;
  original_name: string;
  visibility?: FileVisibility;
  context_type?: string;
  context_id?: string;
  expires_at?: string;
}

export interface DeclareFileResponse {
  file_id: string;
  upload_url: string;
  upload_expires_at: string;
}

export interface HlmrFile {
  id: string;
  owner_id: string;
  file_type: FileType;
  visibility: FileVisibility;
  status: FileStatus;
  original_name: string;
  content_type: string;
  size_bytes: number | null;
  context_type: string | null;
  context_id: string | null;
  metadata: Record<string, unknown> | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileUrlResponse {
  url: string;
  expires_at: string;
}

export interface FilesListParams {
  file_type?: FileType;
  visibility?: FileVisibility;
  status?: FileStatus;
  page?: number;
  page_size?: number;
}

export interface FilesListResponse {
  items: HlmrFile[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export class FileUploadError extends Error {
  public readonly step: 'declare' | 'upload' | 'confirm';
  public readonly cause?: unknown;

  constructor(step: 'declare' | 'upload' | 'confirm', message: string, cause?: unknown) {
    super(message);
    this.name = 'FileUploadError';
    this.step = step;
    this.cause = cause;
  }
}
