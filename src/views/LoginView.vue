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
            Sign in to your account
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label
              for="login-email"
              class="block text-sm font-medium mb-1.5"
              :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
            >
              Email
            </label>
            <input
              id="login-email"
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

          <div>
            <label
              for="login-password"
              class="block text-sm font-medium mb-1.5"
              :class="theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'"
            >
              Password
            </label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="Enter your password"
              class="w-full px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              :class="theme === 'dark'
                ? 'bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 hover:border-zinc-700'
                : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 hover:border-slate-400'"
            />
          </div>

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
            {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '@/composables/useTheme';

const email = ref('');
const password = ref('');
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { theme } = useTheme();

async function handleLogin() {
  if (!email.value || !password.value) return;

  const success = await authStore.login(email.value, password.value);

  if (success) {
    const redirectPath = route.query.redirect as string || '/';
    router.push(redirectPath);
  }
}
</script>
