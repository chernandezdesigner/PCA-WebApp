<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">PCA Report Writer</h2>
          <p class="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="form-label">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label class="form-label">Password</label>
            <input
              v-model="password"
              type="password"
              required
              class="form-input"
              placeholder="Enter your password"
            />
          </div>

          <div v-if="authStore.error" class="form-error">
            {{ authStore.error }}
          </div>

          <button
            type="submit"
            class="form-button form-button-primary w-full"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading">Logging in...</span>
            <span v-else>Sign In</span>
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

const email = ref('');
const password = ref('');
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

async function handleLogin() {
  if (!email.value || !password.value) return;
  
  const success = await authStore.login(email.value, password.value);
  
  if (success) {
    // Redirect to the originally requested page or home page
    const redirectPath = route.query.redirect as string || '/';
    router.push(redirectPath);
  }
}
</script>
