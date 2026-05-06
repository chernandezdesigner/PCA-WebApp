<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/composables/useTheme';

const emit = defineEmits<{
  done: [];
  skip: [];
}>();

const authStore = useAuthStore();
const { theme } = useTheme();

const visible = ref(false);
const emailInput = ref('');
const saving = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  const userId = authStore.user?.id;
  if (!userId) return;

  const { data } = await supabase
    .from('contact_emails')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (data) {
    emit('done');
  } else {
    visible.value = true;
  }
});

async function handleSubmit() {
  error.value = null;
  const trimmed = emailInput.value.trim();

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    error.value = 'Please enter a valid email address.';
    return;
  }

  saving.value = true;
  const { error: dbError } = await supabase
    .from('contact_emails')
    .insert({ user_id: authStore.user!.id, real_email: trimmed });

  saving.value = false;

  if (dbError) {
    error.value = 'Failed to save. Please try again.';
    return;
  }

  emit('done');
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      :class="theme === 'dark' ? 'bg-black/70' : 'bg-black/40'"
    >
      <div
        class="w-full max-w-md rounded-xl border shadow-xl p-6"
        :class="theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200'"
      >
        <h2
          class="text-base font-semibold mb-1"
          :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
        >
          Add your contact email
        </h2>
        <p
          class="text-sm mb-4"
          :class="theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'"
        >
          We'd like your real email so we can reach you about updates, bugs, or feedback. This is optional.
        </p>

        <input
          v-model="emailInput"
          type="email"
          placeholder="you@example.com"
          @keydown.enter="handleSubmit"
          class="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors mb-1"
          :class="theme === 'dark'
            ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-blue-500'
            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'"
        />

        <p v-if="error" class="text-xs text-red-500 mb-3">{{ error }}</p>
        <p v-else class="mb-3"></p>

        <div class="flex items-center gap-2 justify-end">
          <button
            @click="emit('skip')"
            class="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            :class="theme === 'dark'
              ? 'text-zinc-400 border-zinc-700 hover:bg-zinc-800'
              : 'text-slate-500 border-slate-300 hover:bg-slate-50'"
          >
            Skip for now
          </button>
          <button
            @click="handleSubmit"
            :disabled="saving"
            class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-wait flex items-center gap-2"
          >
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? 'Saving...' : 'Save email' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
