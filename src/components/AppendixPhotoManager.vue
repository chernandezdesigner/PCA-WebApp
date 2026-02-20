<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useFieldNotes, type FieldPhoto } from '@/composables/useFieldNotes';
import { useFileUpload, type UploadedFile } from '@/composables/useFileUpload';

export interface AppendixPhoto {
  id: string;
  storage_path: string;
  filename: string;
  notes: string;
  captured_at: string;
  sort_order: number;
  source: 'mobile' | 'web';
  bucket: string;
}

const props = defineProps<{
  modelValue: AppendixPhoto[];
  reportId: string;
  bucket: string;
  storagePath: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: AppendixPhoto[]];
}>();

const { theme } = useTheme();
const { uploadFiles, getPublicUrl: getUploadedUrl } = useFileUpload();

const reportIdRef = toRef(props, 'reportId');
const {
  allPhotos,
  getPhotoUrl: getMobilePhotoUrl,
  getThumbnailUrl: getMobileThumbnailUrl,
} = useFieldNotes(reportIdRef);

const fileInput = ref<HTMLInputElement | null>(null);
const draggedIndex = ref<number | null>(null);
const initialized = ref(false);

const photos = computed(() => props.modelValue);

// Pre-populate from mobile photos when they first load
watch(allPhotos, (mobilePhotos) => {
  if (initialized.value || mobilePhotos.length === 0) return;
  if (props.modelValue.length > 0) {
    initialized.value = true;
    return;
  }

  const prepopulated: AppendixPhoto[] = mobilePhotos.map((p: FieldPhoto & { formType?: string; formStep?: number }, idx: number) => ({
    id: p.id,
    storage_path: p.storage_path,
    filename: p.filename || `photo-${idx + 1}.jpg`,
    notes: p.notes || '',
    captured_at: p.captured_at,
    sort_order: idx,
    source: 'mobile' as const,
    bucket: 'assessment-photos',
  }));

  initialized.value = true;
  emit('update:modelValue', prepopulated);
}, { immediate: true });

function getPhotoThumbnail(photo: AppendixPhoto): string {
  if (photo.source === 'mobile') {
    return getMobilePhotoUrl(photo.storage_path);
  }
  return getUploadedUrl(photo.bucket, photo.storage_path);
}

function updateNotes(index: number, notes: string) {
  const updated = [...props.modelValue];
  updated[index] = { ...updated[index], notes };
  emit('update:modelValue', updated);
}

function removePhoto(index: number) {
  const updated = [...props.modelValue];
  updated.splice(index, 1);
  updated.forEach((p, i) => p.sort_order = i);
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
  updated.forEach((p, i) => p.sort_order = i);
  draggedIndex.value = index;
  emit('update:modelValue', updated);
}

function handleItemDragEnd() {
  draggedIndex.value = null;
}

function triggerFileSelect() {
  fileInput.value?.click();
}

async function handleInputChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const uploaded = await uploadFiles(
    Array.from(input.files),
    props.bucket,
    props.storagePath,
  );

  if (uploaded.length > 0) {
    const newPhotos: AppendixPhoto[] = uploaded.map((f: UploadedFile, idx: number) => ({
      id: f.id,
      storage_path: f.storage_path,
      filename: f.filename,
      notes: '',
      captured_at: f.uploaded_at,
      sort_order: props.modelValue.length + idx,
      source: 'web' as const,
      bucket: props.bucket,
    }));
    emit('update:modelValue', [...props.modelValue, ...newPhotos]);
  }
  input.value = '';
}
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/gif"
      multiple
      class="hidden"
      @change="handleInputChange"
    />

    <!-- Photo count and actions -->
    <div
      v-if="photos.length > 0"
      class="flex items-center justify-between mb-3"
    >
      <span
        class="text-sm font-medium"
        :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
      >
        {{ photos.length }} photo{{ photos.length !== 1 ? 's' : '' }}
        <span
          class="font-normal"
          :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'"
        > &middot; Drag to reorder &middot; Numbers set PDF order</span>
      </span>
      <button
        @click="triggerFileSelect"
        class="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
      >
        + Add Photos
      </button>
    </div>

    <!-- Photo grid -->
    <div v-if="photos.length > 0" class="space-y-2">
      <div
        v-for="(photo, idx) in photos"
        :key="photo.id"
        draggable="true"
        @dragstart="handleItemDragStart(idx)"
        @dragover="handleItemDragOver($event, idx)"
        @dragend="handleItemDragEnd"
        class="flex items-center gap-3 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-all group"
        :class="[
          theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700' : 'border-slate-200 bg-white hover:border-slate-300',
          draggedIndex === idx ? 'opacity-50' : ''
        ]"
      >
        <!-- Number -->
        <span
          class="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
          :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'"
        >
          {{ idx + 1 }}
        </span>

        <!-- Drag handle -->
        <div
          class="flex-shrink-0"
          :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>

        <!-- Thumbnail -->
        <div
          class="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden ring-1"
          :class="theme === 'dark' ? 'ring-zinc-700 bg-zinc-800' : 'ring-slate-200 bg-slate-100'"
        >
          <img
            :src="getPhotoThumbnail(photo)"
            :alt="photo.notes || photo.filename"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <!-- Editable label -->
        <div class="flex-1 min-w-0">
          <input
            :value="photo.notes"
            @input="updateNotes(idx, ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Enter photo label..."
            class="w-full px-2.5 py-1.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            :class="theme === 'dark'
              ? 'bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-500 hover:border-zinc-600'
              : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300'"
          />
          <div class="flex items-center gap-2 mt-1">
            <span
              class="text-[10px] px-1.5 py-0.5 rounded"
              :class="photo.source === 'mobile'
                ? theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                : theme === 'dark' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'"
            >
              {{ photo.source === 'mobile' ? 'Mobile' : 'Uploaded' }}
            </span>
            <span
              class="text-[10px] truncate"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              {{ photo.filename }}
            </span>
          </div>
        </div>

        <!-- Remove -->
        <button
          @click="removePhoto(idx)"
          class="flex-shrink-0 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          :class="theme === 'dark'
            ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10'
            : 'text-slate-400 hover:text-red-500 hover:bg-red-50'"
          aria-label="Remove photo"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      @click="triggerFileSelect"
      class="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
      :class="theme === 'dark'
        ? 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/30'
        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'"
    >
      <div class="flex flex-col items-center gap-2">
        <svg
          class="w-10 h-10"
          :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p
          class="text-sm font-medium"
          :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'"
        >
          Photos will populate from mobile assessment
        </p>
        <p
          class="text-xs"
          :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
        >
          Or click to upload additional photos
        </p>
      </div>
    </div>
  </div>
</template>
