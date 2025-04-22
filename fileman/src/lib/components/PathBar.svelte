<script lang="ts">
  import { fileSystem } from '../stores/fs';
  import { getBreadcrumbs } from '../utils/fileUtils';

  export let path: string = '';
  export let fs = fileSystem; // Default to the main file system instance

  let isEditing = false;
  let editPath = '';

  $: breadcrumbs = getBreadcrumbs(path);

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

  function navigateToBreadcrumb(breadcrumbPath: string) {
    fs.navigateTo(breadcrumbPath);
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
    <div class="breadcrumbs" on:click={startEditing}>
      {#each breadcrumbs as crumb, index}
        <span
          class="breadcrumb"
          on:click|stopPropagation={() => navigateToBreadcrumb(crumb.path)}
        >
          {crumb.name}
        </span>
        {#if index < breadcrumbs.length - 1}
          <span class="separator">/</span>
        {/if}
      {/each}
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

  .breadcrumbs {
    flex: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: text;
    min-height: 32px;
  }

  .breadcrumb {
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
  }

  .breadcrumb:hover {
    background-color: #e3f2fd;
  }

  .separator {
    margin: 0 4px;
    color: #999;
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

    .breadcrumbs {
      background-color: #333;
      border: 1px solid #444;
      color: #eee;
    }

    .breadcrumb:hover {
      background-color: #0d47a1;
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
