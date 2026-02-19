<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import type { FieldPhoto } from '@/composables/useFieldNotes';

const props = defineProps<{
  photos: FieldPhoto[];
  getPhotoUrl: (path: string) => string;
  getThumbnailUrl: (photo: FieldPhoto) => string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { theme } = useTheme();

type ViewMode = 'grid' | 'detail';
const viewMode = ref<ViewMode>('grid');
const selectedIndex = ref(0);
const imageLoading = ref(false);

const selectedPhoto = computed(() => props.photos[selectedIndex.value] ?? null);

const fullSizeUrl = computed(() => {
  if (!selectedPhoto.value) return '';
  return props.getPhotoUrl(selectedPhoto.value.storage_path);
});

function openDetail(index: number) {
  selectedIndex.value = index;
  imageLoading.value = true;
  viewMode.value = 'detail';
}

function backToGrid() {
  viewMode.value = 'grid';
}

function goNext() {
  if (selectedIndex.value < props.photos.length - 1) {
    selectedIndex.value++;
    imageLoading.value = true;
  }
}

function goPrev() {
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
    imageLoading.value = true;
  }
}

function onImageLoad() {
  imageLoading.value = false;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (viewMode.value === 'detail') {
      backToGrid();
    } else {
      emit('close');
    }
  }
  if (viewMode.value === 'detail') {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      class="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b"
      :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
    >
      <button
        @click="viewMode === 'detail' ? backToGrid() : emit('close')"
        class="p-1 rounded-md transition-colors"
        :class="theme === 'dark'
          ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'"
        :aria-label="viewMode === 'detail' ? 'Back to grid' : 'Back to notes'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <svg
        class="w-4 h-4 flex-shrink-0"
        :class="theme === 'dark' ? 'text-blue-400' : 'text-blue-500'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>

      <h3
        class="text-sm font-semibold truncate"
        :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
      >
        <template v-if="viewMode === 'detail' && selectedPhoto?.notes">
          {{ selectedPhoto.notes }}
        </template>
        <template v-else>
          Photos
        </template>
      </h3>

      <span
        class="ml-auto flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium"
        :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'"
      >
        <template v-if="viewMode === 'detail'">
          {{ selectedIndex + 1 }} / {{ photos.length }}
        </template>
        <template v-else>
          {{ photos.length }}
        </template>
      </span>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="p-3">
        <div class="grid grid-cols-2 gap-2.5">
          <button
            v-for="(photo, idx) in photos"
            :key="photo.id"
            @click="openDetail(idx)"
            class="group relative aspect-square rounded-lg overflow-hidden ring-1 transition-all duration-200 hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            :class="theme === 'dark'
              ? 'ring-zinc-800 hover:ring-zinc-600 bg-zinc-900'
              : 'ring-slate-200 hover:ring-slate-400 bg-slate-100'"
          >
            <img
              :src="getThumbnailUrl(photo)"
              :alt="photo.notes || photo.filename || `Photo ${idx + 1}`"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2"
              :class="theme === 'dark'
                ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'
                : 'bg-gradient-to-t from-black/70 via-black/10 to-transparent'"
            >
              <p
                v-if="photo.notes"
                class="text-white text-[11px] font-medium truncate"
              >
                {{ photo.notes }}
              </p>
              <p class="text-white/70 text-[10px] mt-0.5">
                {{ formatDate(photo.captured_at) }}
              </p>
            </div>
          </button>
        </div>
      </div>

      <!-- Detail View -->
      <div v-else class="flex flex-col">
        <!-- Image -->
        <div
          class="relative w-full flex items-center justify-center"
          :class="theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-100'"
          style="min-height: 260px;"
        >
          <!-- Loading spinner -->
          <div
            v-if="imageLoading"
            class="absolute inset-0 flex items-center justify-center z-10"
          >
            <svg
              class="w-7 h-7 animate-spin"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>

          <!-- Prev button -->
          <button
            v-if="selectedIndex > 0"
            @click="goPrev"
            class="absolute left-2 z-20 p-1.5 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
            :class="theme === 'dark'
              ? 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'"
            aria-label="Previous photo"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            :key="selectedPhoto?.id"
            :src="fullSizeUrl"
            :alt="selectedPhoto?.notes || selectedPhoto?.filename || 'Photo'"
            class="w-full object-contain select-none"
            style="max-height: 360px;"
            :class="imageLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'"
            @load="onImageLoad"
            draggable="false"
          />

          <!-- Next button -->
          <button
            v-if="selectedIndex < photos.length - 1"
            @click="goNext"
            class="absolute right-2 z-20 p-1.5 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
            :class="theme === 'dark'
              ? 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'"
            aria-label="Next photo"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Metadata -->
        <div
          class="px-4 py-3 space-y-2 border-t"
          :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
        >
          <p
            v-if="selectedPhoto?.notes"
            class="text-sm font-medium"
            :class="theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'"
          >
            {{ selectedPhoto.notes }}
          </p>
          <div class="flex items-center gap-3">
            <p
              v-if="selectedPhoto?.captured_at"
              class="text-xs"
              :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
            >
              {{ formatDate(selectedPhoto.captured_at) }}
            </p>
            <p
              v-if="selectedPhoto?.filename"
              class="text-xs truncate"
              :class="theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'"
            >
              {{ selectedPhoto.filename }}
            </p>
          </div>
        </div>

        <!-- Thumbnail strip -->
        <div
          v-if="photos.length > 1"
          class="px-3 py-2.5 border-t"
          :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
        >
          <div class="flex gap-1.5 overflow-x-auto scrollbar-thin">
            <button
              v-for="(photo, idx) in photos"
              :key="photo.id"
              @click="openDetail(idx)"
              class="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden ring-1 transition-all"
              :class="[
                idx === selectedIndex
                  ? 'ring-2 ring-blue-500 opacity-100'
                  : theme === 'dark'
                    ? 'ring-zinc-700 opacity-60 hover:opacity-100'
                    : 'ring-slate-300 opacity-60 hover:opacity-100'
              ]"
            >
              <img
                :src="getThumbnailUrl(photo)"
                :alt="photo.notes || `Photo ${idx + 1}`"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}
.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}
</style>
