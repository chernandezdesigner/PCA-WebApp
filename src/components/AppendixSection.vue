<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import FileUploadZone from '@/components/FileUploadZone.vue';
import AppendixPhotoManager from '@/components/AppendixPhotoManager.vue';
import type { UploadedFile } from '@/composables/useFileUpload';
import type { AppendixPhoto } from '@/components/AppendixPhotoManager.vue';

interface AppendicesData {
  cover_photo?: { files: UploadedFile[] };
  table_1_deficiencies?: { files: UploadedFile[] };
  table_2_reserves?: { files: UploadedFile[] };
  appendix_a?: { files: UploadedFile[] };
  appendix_b?: { photos: AppendixPhoto[] };
  appendix_c?: { files: UploadedFile[] };
  appendix_d?: { files: UploadedFile[] };
  appendix_e?: { files: UploadedFile[] };
}

const props = defineProps<{
  modelValue: AppendicesData;
  reportId: string;
  userId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: AppendicesData];
}>();

const { theme } = useTheme();

const BUCKET = 'report-documents';

function storagePath(appendix: string): string {
  return `${props.userId}/${props.reportId}/appendix-${appendix}`;
}

const coverPhotoFiles = computed({
  get: () => props.modelValue.cover_photo?.files ?? [],
  set: (files) => emit('update:modelValue', { ...props.modelValue, cover_photo: { files } }),
});

const table1Files = computed({
  get: () => props.modelValue.table_1_deficiencies?.files ?? [],
  set: (files) => emit('update:modelValue', { ...props.modelValue, table_1_deficiencies: { files } }),
});

const table2Files = computed({
  get: () => props.modelValue.table_2_reserves?.files ?? [],
  set: (files) => emit('update:modelValue', { ...props.modelValue, table_2_reserves: { files } }),
});

const appendixAFiles = computed({
  get: () => props.modelValue.appendix_a?.files ?? [],
  set: (files) => emit('update:modelValue', { ...props.modelValue, appendix_a: { files } }),
});

const appendixBPhotos = computed({
  get: () => props.modelValue.appendix_b?.photos ?? [],
  set: (photos) => emit('update:modelValue', { ...props.modelValue, appendix_b: { photos } }),
});

const appendixCFiles = computed({
  get: () => props.modelValue.appendix_c?.files ?? [],
  set: (files) => emit('update:modelValue', { ...props.modelValue, appendix_c: { files } }),
});

const appendixDFiles = computed({
  get: () => props.modelValue.appendix_d?.files ?? [],
  set: (files) => emit('update:modelValue', { ...props.modelValue, appendix_d: { files } }),
});

const appendixEFiles = computed({
  get: () => props.modelValue.appendix_e?.files ?? [],
  set: (files) => emit('update:modelValue', { ...props.modelValue, appendix_e: { files } }),
});

const sections = [
  { key: 'a', letter: 'A', title: 'Property Maps, Drawings, and Description' },
  { key: 'b', letter: 'B', title: 'Property Photographs' },
  { key: 'c', letter: 'C', title: 'Interview/Questionnaire Documentation/Correspondence' },
  { key: 'd', letter: 'D', title: 'Supporting Documents' },
  { key: 'e', letter: 'E', title: 'Personal Qualifications' },
];
</script>

<template>
  <div class="space-y-12">
    <!-- Cover Photo -->
    <div>
      <div class="flex items-center gap-3 mb-5">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3
            class="text-lg font-bold tracking-tight"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            Cover Photo
          </h3>
          <p
            class="text-sm"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            Main property photo for the report cover page
          </p>
        </div>
        <div
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        />
      </div>
      <FileUploadZone
        v-model="coverPhotoFiles"
        accept="image/png,image/jpeg"
        :max-files="1"
        :bucket="BUCKET"
        :storage-path="storagePath('cover-photo')"
      />
    </div>

    <!-- Table 1 -->
    <div>
      <div class="flex items-center gap-3 mb-5">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3
            class="text-lg font-bold tracking-tight"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            Table 1
          </h3>
          <p
            class="text-sm"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            Physical Deficiencies / Deferred Maintenance
          </p>
        </div>
        <div
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        />
      </div>
      <FileUploadZone
        v-model="table1Files"
        accept="image/png,image/jpeg,application/pdf"
        :max-files="1"
        :bucket="BUCKET"
        :storage-path="storagePath('table-1')"
      />
    </div>

    <!-- Table 2 -->
    <div>
      <div class="flex items-center gap-3 mb-5">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3
            class="text-lg font-bold tracking-tight"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            Table 2
          </h3>
          <p
            class="text-sm"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            Capital Replacement Reserve Schedule
          </p>
        </div>
        <div
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        />
      </div>
      <FileUploadZone
        v-model="table2Files"
        accept="image/png,image/jpeg,application/pdf"
        :max-files="1"
        :bucket="BUCKET"
        :storage-path="storagePath('table-2')"
      />
    </div>

    <!-- Divider between uploads and appendices -->
    <div
      class="border-t pt-4"
      :class="theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'"
    >
      <h2
        class="text-xl font-bold tracking-tight"
        :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
      >
        Appendices A–E
      </h2>
    </div>

    <div v-for="section in sections" :key="section.key">
      <!-- Section header -->
      <div class="flex items-center gap-3 mb-5">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
          :class="theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'"
        >
          {{ section.letter }}
        </div>
        <div>
          <h3
            class="text-lg font-bold tracking-tight"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            Appendix {{ section.letter }}
          </h3>
          <p
            class="text-sm"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            {{ section.title }}
          </p>
        </div>
        <div
          class="flex-1 h-px self-center ml-2"
          :class="theme === 'dark' ? 'bg-zinc-800/60' : 'bg-slate-200'"
        />
      </div>

      <!-- Appendix A -->
      <FileUploadZone
        v-if="section.key === 'a'"
        v-model="appendixAFiles"
        :bucket="BUCKET"
        :storage-path="storagePath('a')"
      />

      <!-- Appendix B -->
      <AppendixPhotoManager
        v-else-if="section.key === 'b'"
        v-model="appendixBPhotos"
        :report-id="reportId"
        :bucket="BUCKET"
        :storage-path="storagePath('b')"
      />

      <!-- Appendix C -->
      <FileUploadZone
        v-else-if="section.key === 'c'"
        v-model="appendixCFiles"
        :bucket="BUCKET"
        :storage-path="storagePath('c')"
      />

      <!-- Appendix D -->
      <FileUploadZone
        v-else-if="section.key === 'd'"
        v-model="appendixDFiles"
        :bucket="BUCKET"
        :storage-path="storagePath('d')"
      />

      <!-- Appendix E -->
      <FileUploadZone
        v-else-if="section.key === 'e'"
        v-model="appendixEFiles"
        :bucket="BUCKET"
        :storage-path="storagePath('e')"
      />
    </div>
  </div>
</template>
