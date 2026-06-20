<template>
  <div
    class="min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-150"
    :class="theme === 'dark' ? 'bg-zinc-950' : 'bg-slate-100'"
  >
    <div class="w-full max-w-md">
      <div
        class="rounded-xl p-8 space-y-6 transition-colors duration-150"
        :class="theme === 'dark'
          ? 'bg-zinc-900 border border-zinc-800'
          : 'bg-white shadow-lg'"
      >
        <div class="text-center">
          <h1
            class="text-2xl font-bold"
            :class="theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'"
          >
            PCA Report Writer
          </h1>
          <p
            class="mt-2 text-sm"
            :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'"
          >
            {{ headingSubtext }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Email (all modes except reset) -->
          <div v-if="mode !== 'reset'">
            <label
              for="auth-email"
              class="block text-sm font-medium mb-1.5"
              :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
            >
              Email
            </label>
            <input
              id="auth-email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@company.com"
              class="w-full px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              :class="theme === 'dark'
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700'
                : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 hover:border-slate-400'"
            />
          </div>

          <!-- Password (signin + signup) -->
          <div v-if="mode === 'signin' || mode === 'signup'">
            <label
              for="auth-password"
              class="block text-sm font-medium mb-1.5"
              :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
            >
              Password
            </label>
            <input
              id="auth-password"
              v-model="password"
              type="password"
              required
              :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
              placeholder="Enter your password"
              class="w-full px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              :class="theme === 'dark'
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700'
                : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 hover:border-slate-400'"
            />

            <!-- Forgot password link (signin only) -->
            <div v-if="mode === 'signin'" class="mt-1.5 text-right">
              <button
                type="button"
                class="text-xs hover:underline"
                :class="theme === 'dark' ? 'text-blue-400' : 'text-blue-600'"
                @click="mode = 'forgot'"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <!-- New Password (reset mode) -->
          <div v-if="mode === 'reset'">
            <label
              for="auth-new-password"
              class="block text-sm font-medium mb-1.5"
              :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
            >
              New Password
            </label>
            <input
              id="auth-new-password"
              v-model="password"
              type="password"
              required
              autocomplete="new-password"
              placeholder="Enter new password"
              class="w-full px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              :class="theme === 'dark'
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700'
                : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 hover:border-slate-400'"
            />
          </div>

          <!-- Confirm Password (signup + reset) -->
          <div v-if="mode === 'signup' || mode === 'reset'">
            <label
              for="auth-confirm-password"
              class="block text-sm font-medium mb-1.5"
              :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
            >
              Confirm Password
            </label>
            <input
              id="auth-confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              placeholder="Confirm your password"
              class="w-full px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              :class="theme === 'dark'
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700'
                : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 hover:border-slate-400'"
            />
          </div>

          <!-- Client-side validation error -->
          <div
            v-if="validationError"
            class="flex items-start gap-3 p-3 rounded-lg text-sm"
            :class="theme === 'dark'
              ? 'bg-red-950/50 text-red-300'
              : 'bg-red-50 text-red-700'"
            role="alert"
          >
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ validationError }}</span>
          </div>

          <!-- Server error -->
          <div
            v-if="authStore.error"
            class="flex items-start gap-3 p-3 rounded-lg text-sm"
            :class="theme === 'dark'
              ? 'bg-red-950/50 text-red-300'
              : 'bg-red-50 text-red-700'"
            role="alert"
          >
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ authStore.error }}</span>
          </div>

          <!-- Success message -->
          <div
            v-if="authStore.successMessage"
            class="flex items-start gap-3 p-3 rounded-lg text-sm"
            :class="theme === 'dark'
              ? 'bg-emerald-950/50 text-emerald-300'
              : 'bg-emerald-50 text-emerald-700'"
            role="status"
          >
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ authStore.successMessage }}</span>
          </div>

          <button
            type="submit"
            class="w-full inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            :class="theme === 'dark' ? 'focus:ring-offset-zinc-900' : 'focus:ring-offset-white'"
            :disabled="authStore.loading"
          >
            <svg v-if="authStore.loading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ authStore.loading ? submitLoadingLabel : submitLabel }}
          </button>
        </form>

        <!-- Mode toggle links -->
        <div class="text-center text-sm" :class="theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'">
          <template v-if="mode === 'signin'">
            Don't have an account?
            <button
              type="button"
              class="font-medium hover:underline"
              :class="theme === 'dark' ? 'text-blue-400' : 'text-blue-600'"
              @click="mode = 'signup'"
            >
              Sign Up
            </button>
          </template>
          <template v-else-if="mode === 'signup'">
            Already have an account?
            <button
              type="button"
              class="font-medium hover:underline"
              :class="theme === 'dark' ? 'text-blue-400' : 'text-blue-600'"
              @click="mode = 'signin'"
            >
              Sign In
            </button>
          </template>
          <template v-else-if="mode === 'forgot'">
            <button
              type="button"
              class="font-medium hover:underline"
              :class="theme === 'dark' ? 'text-blue-400' : 'text-blue-600'"
              @click="mode = 'signin'"
            >
              Back to Sign In
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '@/composables/useTheme';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

const mode = ref<AuthMode>('signin');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const validationError = ref<string | null>(null);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { theme } = useTheme();

// If we arrived via a password recovery link, switch to reset mode
onMounted(() => {
  if (authStore.passwordRecovery) {
    mode.value = 'reset';
  }
});

const headingSubtext = computed(() => {
  switch (mode.value) {
    case 'signin': return 'Sign in to your account';
    case 'signup': return 'Create a new account';
    case 'forgot': return 'Reset your password';
    case 'reset': return 'Choose a new password';
  }
});

const submitLabel = computed(() => {
  switch (mode.value) {
    case 'signin': return 'Sign In';
    case 'signup': return 'Create Account';
    case 'forgot': return 'Send Reset Link';
    case 'reset': return 'Update Password';
  }
});

const submitLoadingLabel = computed(() => {
  switch (mode.value) {
    case 'signin': return 'Signing in...';
    case 'signup': return 'Creating account...';
    case 'forgot': return 'Sending...';
    case 'reset': return 'Updating...';
  }
});

// Clear state when switching modes
watch(mode, () => {
  authStore.clearMessages();
  validationError.value = null;
  password.value = '';
  confirmPassword.value = '';
});

async function handleSubmit() {
  validationError.value = null;

  if (mode.value === 'signup' || mode.value === 'reset') {
    if (password.value.length < 6) {
      validationError.value = 'Password must be at least 6 characters.';
      return;
    }
    if (password.value !== confirmPassword.value) {
      validationError.value = 'Passwords do not match.';
      return;
    }
  }

  if (mode.value === 'signin') {
    if (!email.value || !password.value) return;
    const success = await authStore.login(email.value, password.value);
    if (success) {
      const redirectPath = route.query.redirect as string || '/';
      router.push(redirectPath);
    }
  } else if (mode.value === 'signup') {
    if (!email.value || !password.value) return;
    const success = await authStore.signUp(email.value, password.value);
    // If sign-up returned a session (confirmation disabled), redirect
    if (success && authStore.user) {
      const redirectPath = route.query.redirect as string || '/';
      router.push(redirectPath);
    }
  } else if (mode.value === 'reset') {
    if (!password.value) return;
    const success = await authStore.updatePassword(password.value);
    if (success) {
      setTimeout(() => router.push('/'), 1500);
    }
  } else {
    if (!email.value) return;
    await authStore.resetPassword(email.value);
  }
}
</script>
