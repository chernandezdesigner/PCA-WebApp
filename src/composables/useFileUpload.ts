import { ref } from 'vue';
import { supabase } from '@/services/supabase';

export interface UploadedFile {
  id: string;
  storage_path: string;
  filename: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function useFileUpload() {
  const uploading = ref(false);
  const activeUploads = ref<UploadProgress[]>([]);

  async function uploadFile(
    file: File,
    bucket: string,
    basePath: string,
  ): Promise<UploadedFile | null> {
    const fileId = generateId();
    const ext = file.name.split('.').pop() || 'bin';
    const storagePath = `${basePath}/${fileId}.${ext}`;

    const progress: UploadProgress = {
      fileId,
      filename: file.name,
      progress: 0,
      status: 'uploading',
    };
    activeUploads.value.push(progress);
    uploading.value = true;

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        progress.status = 'failed';
        progress.error = error.message;
        return null;
      }

      progress.progress = 100;
      progress.status = 'completed';

      return {
        id: fileId,
        storage_path: storagePath,
        filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      };
    } catch (err: unknown) {
      progress.status = 'failed';
      progress.error = err instanceof Error ? err.message : 'Upload failed';
      return null;
    } finally {
      activeUploads.value = activeUploads.value.filter(u => u.status === 'uploading');
      uploading.value = activeUploads.value.length > 0;
    }
  }

  async function uploadFiles(
    files: File[],
    bucket: string,
    basePath: string,
  ): Promise<UploadedFile[]> {
    const results: UploadedFile[] = [];
    for (const file of files) {
      const result = await uploadFile(file, bucket, basePath);
      if (result) results.push(result);
    }
    return results;
  }

  async function deleteFile(bucket: string, storagePath: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([storagePath]);
    return !error;
  }

  function getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  return {
    uploading,
    activeUploads,
    uploadFile,
    uploadFiles,
    deleteFile,
    getPublicUrl,
  };
}
