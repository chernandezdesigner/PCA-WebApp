import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/services/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);
  const passwordRecovery = ref(false);

  function clearMessages() {
    error.value = null;
    successMessage.value = null;
  }

  // Initialize auth state
  async function initialize() {
    // Always attach the listener, even if getSession() fails
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null;
      if (event === 'PASSWORD_RECOVERY') {
        passwordRecovery.value = true;
      }
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      user.value = session?.user ?? null;
    } catch (err) {
      console.error('Error initializing auth:', err);
    }
  }

  // Login
  async function login(email: string, password: string) {
    loading.value = true;
    clearMessages();

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

  // Sign up
  async function signUp(email: string, password: string) {
    loading.value = true;
    clearMessages();

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        error.value = authError.message;
        return false;
      }

      // Supabase returns a user with empty identities array for duplicate emails
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        error.value = 'An account with this email already exists. Try signing in instead.';
        return false;
      }

      // If email confirmation is enabled, session will be null
      if (!data.session) {
        successMessage.value = 'Check your email for a confirmation link to complete your registration.';
        return true;
      }

      // If confirmation is disabled, user is immediately signed in
      user.value = data.user;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred during sign up';
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Reset password
  async function resetPassword(email: string) {
    loading.value = true;
    clearMessages();

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });

      if (authError) {
        error.value = authError.message;
        return false;
      }

      successMessage.value = 'If an account exists with that email, a password reset link has been sent.';
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred sending the reset link';
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Update password (after clicking reset link)
  async function updatePassword(newPassword: string) {
    loading.value = true;
    clearMessages();

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        error.value = authError.message;
        return false;
      }

      passwordRecovery.value = false;
      successMessage.value = 'Password updated successfully. Redirecting...';
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred updating your password';
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Logout
  async function logout() {
    loading.value = true;
    clearMessages();

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
    successMessage,
    passwordRecovery,
    initialize,
    login,
    signUp,
    resetPassword,
    updatePassword,
    clearMessages,
    logout,
  };
});
