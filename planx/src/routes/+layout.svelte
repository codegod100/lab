<script>
  import "../app.css"; // Import the Tailwind CSS entry point

  // Theme handling
  let theme = $state("light");

  function toggleTheme() {
    theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem('theme', theme);
  }

  // Initialize theme on client-side
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') || 'light';
    theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
</script>

<!-- Theme toggle button -->
<div class="fixed top-4 right-4 z-50">
  <button class="btn btn-primary" onclick={toggleTheme}>
    {#if theme === "light"}
      Dark Mode
    {:else}
      Light Mode
    {/if}
  </button>
</div>

<!-- Render the page content with theme-aware background -->
<div class="min-h-screen bg-base-100 text-base-content">
  <slot />
</div>
