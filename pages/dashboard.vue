<template>
  <div class="dashboard-page">
    <header class="header">
      <NuxtLink to="/" class="back-link">← Back</NuxtLink>
      <h1>Dashboard</h1>
    </header>
    <main class="main">
      <div v-if="pending" class="loading">Loading stats...</div>
      <div v-else-if="error" class="error">Failed to load stats: {{ error.message }}</div>
      <div v-else class="stats">
        <div class="stat-card">
          <h3>Total Challenges</h3>
          <p class="stat-value">{{ stats?.totalChallenges || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Solves</h3>
          <p class="stat-value">{{ stats?.totalSolves || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Success Rate</h3>
          <p class="stat-value">{{ ((stats?.successRate || 0) * 100).toFixed(1) }}%</p>
        </div>
        <div class="stat-card">
          <h3>Avg Solve Time</h3>
          <p class="stat-value">{{ ((stats?.avgSolveTime || 0) / 1000).toFixed(1) }}s</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { data: stats, pending, error } = await useFetch('/api/captcha/stats')
</script>

<style scoped>
.dashboard-page { min-height: 100vh; }
.header { padding: 1.5rem 2rem; }
.back-link { color: #9ca3af; text-decoration: none; }
.back-link:hover { color: #fff; }
.header h1 { margin-top: 0.5rem; }
.main { max-width: 900px; margin: 0 auto; padding: 2rem; }
.loading, .error { text-align: center; padding: 3rem; }
.error { color: #ef4444; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; }
.stat-card { background: #1f2937; padding: 1.5rem; border-radius: 12px; text-align: center; }
.stat-card h3 { color: #9ca3af; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
.stat-value { font-size: 2rem; font-weight: 700; color: #4ade80; }
</style>
