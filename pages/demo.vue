<template>
  <div class="demo-page">
    <header class="header">
      <NuxtLink to="/" class="back-link">← Back</NuxtLink>
      <h1>Demo</h1>
    </header>
    <main class="main">
      <p class="instructions">Slide the puzzle pieces to restore the image</p>
      <SlidingCaptcha />
    </main>
  </div>
</template>

<script setup>
import SlidingCaptcha from '~/components/SlidingCaptcha.vue'
</script>

<style scoped>
.demo-page { min-height: 100vh; display: flex; flex-direction: column; }
.header { padding: 1.5rem 2rem; }
.back-link { color: #9ca3af; text-decoration: none; }
.back-link:hover { color: #fff; }
.header h1 { margin-top: 0.5rem; }
.main { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 2rem; }
.instructions { color: #9ca3af; margin-bottom: 2rem; }
</style>
