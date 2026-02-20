<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import FileUploadZone from '@/components/FileUploadZone.vue';
import AppendixPhotoManager from '@/components/AppendixPhotoManager.vue';
import type { UploadedFile } from '@/composables/useFileUpload';
import type { AppendixPhoto } from '@/components/AppendixPhotoManager.vue';

interface AppendicesData {
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
