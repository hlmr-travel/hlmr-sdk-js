/**
 * FilesModule — file upload and management via presigned URLs.
 *
 * Upload flow: declare → fetch(upload_url) → confirm
 * Step 2 uses native fetch (direct OVH upload, no JWT/JSend).
 */
import type { HttpClient } from '../utils/http';
import type {
  FileUploadOptions,
  DeclareFileResponse,
  HlmrFile,
  FileUrlResponse,
  FilesListParams,
  FilesListResponse,
} from '../types/files';
import { FileUploadError } from '../types/files';

export class FilesModule {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Upload a file end-to-end: declare → upload to OVH → confirm.
   * Returns the confirmed file metadata.
   */
  async upload(blob: Blob | File, options: FileUploadOptions): Promise<HlmrFile> {
    // Step 1: Declare
    let declared: DeclareFileResponse;
    try {
      const response = await this.http.post<DeclareFileResponse>(
        'files/declare',
        options,
      );
      declared = response.data;
    } catch (err) {
      throw new FileUploadError('declare', 'Failed to declare file', err);
    }

    // Step 2: Upload directly to OVH via presigned PUT URL (native fetch, no JWT)
    try {
      const uploadResponse = await fetch(declared.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': options.content_type },
        body: blob,
      });
      if (!uploadResponse.ok) {
        throw new Error(`OVH upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
    } catch (err) {
      if (err instanceof FileUploadError) throw err;
      throw new FileUploadError('upload', 'Failed to upload file to storage', err);
    }

    // Step 3: Confirm
    try {
      const response = await this.http.post<HlmrFile>(
        `files/${declared.file_id}/confirm`,
      );
      return response.data;
    } catch (err) {
      throw new FileUploadError('confirm', 'Failed to confirm upload', err);
    }
  }

  /** List files for the authenticated user. */
  async list(params?: FilesListParams): Promise<FilesListResponse> {
    const query = buildQueryString(params);
    const path = query ? `files?${query}` : 'files';
    const response = await this.http.get<FilesListResponse>(path);
    return response.data;
  }

  /** Get file metadata by ID. */
  async get(fileId: string): Promise<HlmrFile> {
    const response = await this.http.get<HlmrFile>(`files/${fileId}`);
    return response.data;
  }

  /** Get a presigned download URL for a file. */
  async getUrl(fileId: string): Promise<FileUrlResponse> {
    const response = await this.http.get<FileUrlResponse>(`files/${fileId}/url`);
    return response.data;
  }

  /** Delete a file. */
  async delete(fileId: string): Promise<{ deleted: boolean }> {
    const response = await this.http.delete<{ deleted: boolean }>(`files/${fileId}`);
    return response.data;
  }
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
}
