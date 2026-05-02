<template>
  <div class="demo-page">
    <header class="header">
      <NuxtLink to="/" class="back-link">← Trang chủ</NuxtLink>
      <h1>Demo Slider CAPTCHA</h1>
    </header>
    <main class="main">
      <SliderCaptcha />
    </main>
  </div>
</template>

<script setup>
import SliderCaptcha from '~/components/SliderCaptcha.vue'
</script>

<style scoped>
.demo-page { min-height: 100vh; display: flex; flex-direction: column; }
.header { padding: 1.5rem 2rem; }
.back-link { color: #9ca3af; text-decoration: none; }
.back-link:hover { color: #fff; }
.header h1 { margin-top: 0.5rem; font-size: 1.5rem; }
.main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
</style>
