<script lang="ts">
  import { fileSystem } from '../stores/fs';

  export let path: string = '';
  export let fs = fileSystem; // Default to the main file system instance

  let isEditing = false;
  let editPath = '';
  let showSearch = false;
  let searchQuery = '';

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

  function toggleSearch() {
    showSearch = !showSearch;
    if (showSearch) {
      setTimeout(() => {
        const input = document.getElementById('search-input') as HTMLInputElement;
        if (input) input.focus();
      }, 0);
    } else {
      searchQuery = '';
      fs.setSearchQuery('');
    }
  }

  function handleSearchInput(e: Event) {
    searchQuery = (e.target as HTMLInputElement).value;
    fs.setSearchQuery(searchQuery);
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
    <button class="path-action" on:click={toggleSearch} title="Search">
      <span class="material-symbols-outlined">search</span>
    </button>
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

{#if showSearch}
  <div class="search-row">
    <input
      id="search-input"
      class="search-input"
      type="text"
      placeholder="Search files..."
      bind:value={searchQuery}
      on:input={handleSearchInput}
      on:keydown={(e) => e.key === 'Escape' && toggleSearch()}
    />
  </div>
{/if}

<style>
  .path-bar {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    padding: 12px 16px;
    width: 100%;
    box-sizing: border-box;
  }

  .path-display {
    flex: 1;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: text;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
    display: flex;
    align-items: center;
    min-height: 32px;
  }

  .path-edit {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .path-edit input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #2196f3;
    border-radius: 4px;
    outline: none;
    font-size: 14px;
    min-height: 32px;
    box-sizing: border-box;
  }

  .path-actions {
    display: flex;
    margin-left: 12px;
    gap: 4px;
    align-items: center;
  }

  .path-action {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    min-height: 32px;
  }

  .path-action:hover {
    background-color: #e0e0e0;
  }

  .path-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .search-input {
    margin-left: 8px;
    padding: 6px 10px;
    border: 1px solid #2196f3;
    border-radius: 4px;
    outline: none;
    font-size: 14px;
    min-width: 180px;
    max-width: 300px;
    transition: box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(33,150,243,0.06);
  }

  .search-input:focus {
    border-color: #1976d2;
    box-shadow: 0 2px 12px rgba(33,150,243,0.12);
  }

  .search-row {
    width: 100%;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    padding: 8px 16px 4px 16px;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-end;
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

    .search-row {
      background: #252525;
      border-bottom: 1px solid #444;
    }
  }
</style>
