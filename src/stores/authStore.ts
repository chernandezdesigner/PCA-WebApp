import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/services/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Initialize auth state
  async function initialize() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      user.value = session?.user ?? null;

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null;
      });
    } catch (err) {
      console.error('Error initializing auth:', err);
    }
  }

  // Login
  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        error.value = authError.message;
        return false;
      }

      user.value = data.user;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred during login';
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Logout
  async function logout() {
    loading.value = true;
    error.value = null;

    try {
      const { error: authError } = await supabase.auth.signOut();
      
      if (authError) {
        error.value = authError.message;
        return false;
      }

      user.value = null;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred during logout';
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    loading,
    error,
    initialize,
    login,
    logout,
  };
});
