<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  export let isOpen = false;
  export let onClose = () => {};
  import { open } from '@tauri-apps/plugin-shell';

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  function stopPropagation(event: Event) {
    event.stopPropagation();
  }
</script>

{#if isOpen}
  <div 
    class="about-dialog-backdrop" 
    role="dialog" 
    aria-modal="true" 
    tabindex="-1"
    on:keydown={handleKeyDown}
    on:click={onClose}
  >
    <div 
      class="about-dialog" 
      on:click={stopPropagation}
      on:keydown={stopPropagation}
    >
      <h2>About FileMan</h2>
      <p>FileMan is a modern file manager built with Svelte and Tauri.</p>
      <p>Author: <a 
        href="https://bsky.app/profile/nandi.weird.one" 
        class="about-link" 
        on:click={(e) => {
          e.preventDefault();
          open('https://bsky.app/profile/nandi.weird.one');
        }}
        on:keydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open('https://bsky.app/profile/nandi.weird.one');
          }
        }}
        tabindex="0"
        role="button"
      >@nandi.weird.one</a></p>
      <p>Version: 0.1.0</p>
      <button class="close-btn" on:click={onClose}>Close</button>
    </div>
  </div>
{/if}

<style>
  .about-dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .about-dialog {
    background: #fff;
    color: #222;
    border-radius: 8px;
    padding: 2rem;
    min-width: 300px;
    box-shadow: 0 2px 24px rgba(0,0,0,0.2);
    position: relative;
  }
  .close-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border: none;
    background: #2196f3;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
  }
  .close-btn:hover {
    background: #1976d2;
  }
  .about-link {
    color: #1976d2;
    text-decoration: underline;
    transition: color 0.2s;
  }
  .about-link:hover, .about-link:focus {
    color: #0d47a1;
    outline: none;
  }
  @media (prefers-color-scheme: dark) {
    .about-dialog {
      background: #222;
      color: #eee;
    }
    .about-link {
      color: #90caf9;
    }
    .about-link:hover, .about-link:focus {
      color: #42a5f5;
    }
  }
</style>
