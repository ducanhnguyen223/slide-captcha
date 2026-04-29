<template>
  <div class="landing">
    <header class="header">
      <h1>SlideCAPTCHA</h1>
      <p class="tagline">User-friendly sliding puzzle CAPTCHA</p>
    </header>

    <main class="main">
      <section class="hero">
        <div class="hero-content">
          <h2>Fun & Secure CAPTCHA</h2>
          <p>Replace boring text CAPTCHAs with engaging sliding puzzles that users actually enjoy.</p>
          <div class="cta-buttons">
            <NuxtLink to="/demo" class="btn btn-primary">Try Demo</NuxtLink>
            <NuxtLink to="/dashboard" class="btn btn-secondary">View Stats</NuxtLink>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="feature">
          <h3>Anti-Bot Protection</h3>
          <p>Advanced behavior analysis detects automated scripts with 99%+ accuracy.</p>
        </div>
        <div class="feature">
          <h3>User Friendly</h3>
          <p>Fun puzzles instead of distorted text. Better user experience.</p>
        </div>
        <div class="feature">
          <h3>Easy Integration</h3>
          <p>Simple API to integrate into any website or application.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.landing { min-height: 100vh; }
.header { text-align: center; padding: 3rem 1rem; }
.header h1 {
  font-size: 3rem;
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}
.tagline { color: #9ca3af; font-size: 1.25rem; }
.main { max-width: 900px; margin: 0 auto; padding: 0 1rem; }
.hero { text-align: center; padding: 3rem 0; }
.hero h2 { font-size: 2rem; margin-bottom: 1rem; }
.hero p { color: #9ca3af; margin-bottom: 2rem; }
.cta-buttons { display: flex; gap: 1rem; justify-content: center; }
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s, opacity 0.2s;
}
.btn:hover { transform: translateY(-2px); }
.btn-primary { background: #4ade80; color: #1a1a2e; }
.btn-secondary { background: #374151; color: #fff; }
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 3rem 0;
}
.feature { background: #1f2937; padding: 1.5rem; border-radius: 12px; }
.feature h3 { color: #4ade80; margin-bottom: 0.5rem; }
.feature p { color: #9ca3af; }
</style>
