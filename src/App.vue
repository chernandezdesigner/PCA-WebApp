<script setup lang="ts">
import { onMounted } from 'vue'
import { supabase } from '@/services/supabase'

onMounted(async () => {
  console.log('🔍 Testing Supabase connection...')
  
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('❌ Supabase connection error:', error)
  } else {
    console.log('✅ Supabase connected!', data)
  }
})
</script>

<template>
  <div id="app">
    <p>Check the console for Supabase connection status.</p>
  </div>
</template>