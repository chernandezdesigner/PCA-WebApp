import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

const theme = ref<Theme>('dark');

export function useTheme() {
  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
    
    // Apply to document for global CSS access
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
  }

  // Initialize
  if (typeof window !== 'undefined') {
    document.documentElement.classList.add(theme.value);
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light',
  };
}
