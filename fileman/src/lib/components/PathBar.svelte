<script lang="ts">
  import { fileSystem } from '../stores/fs';

  export let path: string = '';
  export let fs = fileSystem; // Default to the main file system instance

  let isEditing = false;
  let editPath = '';

  function startEditing() {
    isEditing = true;
    editPath = path;

    // Focus the input after rendering
    setTimeout(() => {
      const input = document.getElementById('path-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      submitPath();
    } else if (event.key === 'Escape') {
      isEditing = false;
    }
  }

  function submitPath() {
    if (editPath.trim()) {
      fs.navigateTo(editPath);
    }
    isEditing = false;
  }
</script>

<div class="path-bar">
  {#if isEditing}
    <div class="path-edit">
      <input
        id="path-input"
        type="text"
        bind:value={editPath}
        on:keydown={handleKeyDown}
        on:blur={submitPath}
      />
    </div>
  {:else}
    <div class="path-display" on:click={startEditing}>
      {path}
    </div>
  {/if}

  <div class="path-actions">
    <button
      class="path-action"
      on:click={() => fs.navigateBack()}
      disabled={!$fs.historyIndex || $fs.historyIndex <= 0}
      title="Back"
    >
      <span class="material-symbols-outlined">arrow_back</span>
    </button>

    <button
      class="path-action"
      on:click={() => fs.navigateForward()}
      disabled={!$fs.history || $fs.historyIndex >= $fs.history.length - 1}
      title="Forward"
    >
      <span class="material-symbols-outlined">arrow_forward</span>
    </button>

    <button
      class="path-action"
      on:click={() => fs.navigateUp()}
      title="Up"
    >
      <span class="material-symbols-outlined">arrow_upward</span>
    </button>

    <button
      class="path-action"
      on:click={() => fs.refreshCurrentDirectory()}
      title="Refresh"
    >
      <span class="material-symbols-outlined">refresh</span>
    </button>
  </div>
</div>

<style>
  .path-bar {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    padding: 8px;
    width: 100%;
  }

  .path-display {
    flex: 1;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 6px 8px;
    cursor: text;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
  }

  .path-edit {
    flex: 1;
  }

  .path-edit input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #2196f3;
    border-radius: 4px;
    outline: none;
    font-size: 14px;
  }

  .path-actions {
    display: flex;
    margin-left: 8px;
  }

  .path-action {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .path-action:hover {
    background-color: #e0e0e0;
  }

  .path-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .path-bar {
      background-color: #252525;
      border-bottom: 1px solid #444;
    }

    .path-display {
      background-color: #333;
      border: 1px solid #444;
      color: #eee;
    }

    .path-edit input {
      background-color: #333;
      color: #eee;
      border: 1px solid #2196f3;
    }

    .path-action {
      color: #eee;
    }

    .path-action:hover {
      background-color: #444;
    }
  }
</style>
