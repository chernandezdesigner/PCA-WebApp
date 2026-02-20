<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useFileUpload, type UploadedFile } from '@/composables/useFileUpload';

const props = withDefaults(defineProps<{
  modelValue: UploadedFile[];
  accept?: string;
  maxSizeMb?: number;
  bucket: string;
  storagePath: string;
}>(), {
  accept: 'image/png,image/jpeg,image/gif,application/pdf',
  maxSizeMb: 50,
});

const emit = defineEmits<{
  'update:modelValue': [value: UploadedFile[]];
}>();

const { theme } = useTheme();
const { uploading, uploadFiles, deleteFile, getPublicUrl } = useFileUpload();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const draggedIndex = ref<number | null>(null);

const files = computed(() => props.modelValue);

function isImage(mime: string): boolean {
  return mime.startsWith('image/');
}

function getFileUrl(file: UploadedFile): string {
  return getPublicUrl(props.bucket, file.storage_path);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function triggerFileSelect() {
  fileInput.value?.click();
}

async function handleFiles(fileList: FileList | File[]) {
  const validFiles: File[] = [];
  const acceptTypes = props.accept.split(',').map(t => t.trim());
  const maxBytes = props.maxSizeMb * 1024 * 1024;

  for (const file of Array.from(fileList)) {
    if (!acceptTypes.some(t => file.type === t || file.type.startsWith(t.replace('/*', '/')))) continue;
    if (file.size > maxBytes) continue;
    validFiles.push(file);
  }

  if (validFiles.length === 0) return;

  const uploaded = await uploadFiles(validFiles, props.bucket, props.storagePath);
  if (uploaded.length > 0) {
    emit('update:modelValue', [...props.modelValue, ...uploaded]);
  }
}

function handleInputChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    handleFiles(input.files);
    input.value = '';
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

async function removeFile(index: number) {
  const file = props.modelValue[index];
  if (!file) return;
  await deleteFile(props.bucket, file.storage_path);
  const updated = [...props.modelValue];
  updated.splice(index, 1);
  emit('update:modelValue', updated);
}

function handleItemDragStart(index: number) {
  draggedIndex.value = index;
}

function handleItemDragOver(e: DragEvent, index: number) {
  e.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === index) return;
  const updated = [...props.modelValue];
  const [moved] = updated.splice(draggedIndex.value, 1);
  updated.splice(index, 0, moved);
  draggedIndex.value = index;
  emit('update:modelValue', updated);
}

function handleItemDragEnd() {
  draggedIndex.value = null;
}

async function handlePaste() {
  try {
    const items = await navigator.clipboard.read();
    const pastedFiles: File[] = [];
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          const ext = type.split('/')[1] || 'png';
          pastedFiles.push(new File([blob], `pasted-image.${ext}`, { type }));
        }
      }
    }
    if (pastedFiles.length > 0) {
      await handleFiles(pastedFiles);
    }
  } catch {
    // Clipboard API may not be available
  }
}
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      multiple
      class="hidden"
      @change="handleInputChange"
    />

    <!-- File list -->
    <div
      v-if="files.length > 0"
      class="rounded-xl border overflow-hidden"
      :class="theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white'"
    >
      <!-- Header -->
      <div
        class="px-4 py-2.5 border-b flex items-center justify-between"
        :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
      >
        <span
          class="text-sm font-medium"
          :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
        >
          {{ files.length }} file{{ files.length !== 1 ? 's' : '' }} uploaded
          <span
            class="font-normal"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
          > &middot; Drag to reorder</span>
        </span>
      </div>

      <!-- File cards -->
      <div class="p-3 flex flex-wrap gap-3">
        <div
          v-for="(file, idx) in files"
          :key="file.id"
          draggable="true"
          @dragstart="handleItemDragStart(idx)"
          @dragover="handleItemDragOver($event, idx)"
          @dragend="handleItemDragEnd"
          class="relative group w-[130px] rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
          :class="[
            theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-slate-200 bg-slate-50',
            draggedIndex === idx ? 'opacity-50' : ''
          ]"
        >
          <!-- Remove button -->
          <button
            @click.stop="removeFile(idx)"
            class="absolute top-1 right-1 z-10 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white hover:bg-red-600"
            aria-label="Remove file"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Thumbnail -->
          <div
            class="aspect-square flex items-center justify-center overflow-hidden"
            :class="theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-100'"
          >
            <img
              v-if="isImage(file.mime_type)"
              :src="getFileUrl(file)"
              :alt="file.filename"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div v-else class="flex flex-col items-center gap-1 p-2">
              <svg
                class="w-8 h-8"
                :class="theme === 'dark' ? 'text-red-400' : 'text-red-500'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span
                class="text-[10px] font-bold uppercase"
                :class="theme === 'dark' ? 'text-red-400' : 'text-red-500'"
              >PDF</span>
            </div>
          </div>

          <!-- File info -->
          <div class="px-2 py-1.5">
            <p
              class="text-[11px] font-medium truncate"
              :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
            >
              {{ file.filename }}
            </p>
            <p
              class="text-[10px]"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
            >
              {{ isImage(file.mime_type) ? 'IMAGE' : 'PDF' }} &middot; {{ formatSize(file.file_size) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Add more -->
      <div
        class="px-4 py-3 border-t flex items-center justify-center gap-3"
        :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
      >
        <button
          @click="triggerFileSelect"
          class="text-xs font-medium flex items-center gap-1.5 transition-colors"
          :class="theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Add more files
        </button>
        <span :class="theme === 'dark' ? 'text-zinc-700' : 'text-slate-300'">|</span>
        <span
          class="text-[10px]"
          :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
        >PNG, JPG, GIF up to {{ maxSizeMb }}MB</span>
      </div>

      <!-- Action buttons -->
      <div
        class="px-4 py-2.5 border-t flex items-center gap-2"
        :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
      >
        <button
          @click="triggerFileSelect"
          class="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
        >
          + Add More
        </button>
        <button
          @click="handlePaste"
          class="px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
          :class="theme === 'dark'
            ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            : 'border-slate-300 text-slate-600 hover:bg-slate-50'"
        >
          Paste
        </button>
      </div>
    </div>

    <!-- Empty dropzone -->
    <div
      v-else
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileSelect"
      class="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200"
      :class="[
        isDragging
          ? theme === 'dark'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-blue-400 bg-blue-50'
          : theme === 'dark'
            ? 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/30'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50',
      ]"
    >
      <div class="flex flex-col items-center gap-2">
        <svg
          class="w-10 h-10"
          :class="isDragging
            ? 'text-blue-500'
            : theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p
          class="text-sm font-medium"
          :class="isDragging
            ? 'text-blue-500'
            : theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'"
        >
          {{ isDragging ? 'Drop files here' : 'Drag & drop files here, or click to browse' }}
        </p>
        <p
          class="text-xs"
          :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
        >
          PNG, JPG, GIF, PDF up to {{ maxSizeMb }}MB
        </p>
      </div>

      <!-- Loading indicator -->
      <div v-if="uploading" class="mt-4 flex items-center justify-center gap-2">
        <svg
          class="w-4 h-4 animate-spin"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
          fill="none" viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span
          class="text-xs"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
        >Uploading...</span>
      </div>
    </div>
  </div>
</template>
