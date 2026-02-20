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

  // #region agent log
  supabase.storage.listBuckets().then(({data, error}) => {
    fetch('http://127.0.0.1:7242/ingest/daf524a2-2b5c-47cb-bef4-5cc7decbfe33',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useFileUpload.ts:init',message:'Available buckets',data:{buckets:data?.map(b=>({name:b.name,public:b.public})),error:error?.message},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  });
  // #endregion

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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/daf524a2-2b5c-47cb-bef4-5cc7decbfe33',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useFileUpload.ts:pre-upload',message:'Upload attempt',data:{bucket,storagePath,fileName:file.name,fileType:file.type,fileSize:file.size,fileConstructor:file.constructor.name},timestamp:Date.now(),hypothesisId:'H1-H3-H5'})}).catch(()=>{});
      // #endregion

      const { error, data: uploadData } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/daf524a2-2b5c-47cb-bef4-5cc7decbfe33',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useFileUpload.ts:post-upload',message:'Upload result',data:{success:!error,errorMessage:error?.message,errorName:(error as any)?.name,errorStatus:(error as any)?.statusCode || (error as any)?.status,errorFull:error ? JSON.parse(JSON.stringify(error)) : null,uploadData},timestamp:Date.now(),hypothesisId:'H1-H2-H4'})}).catch(()=>{});
      // #endregion

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
