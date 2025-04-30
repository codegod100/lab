<script lang="ts">
  import { fileSystem } from '../stores/fs';
  import { settings } from '../stores/settings';

  export let selectedCount = 0;

  function createNewFolder() {
    const name = prompt('Enter folder name:', 'New Folder');
    if (name) {
      fileSystem.createDirectory(name);
    }
  }

  function deleteSelected() {
    if (selectedCount === 0) return;

    const confirmMessage = selectedCount === 1
      ? 'Are you sure you want to delete the selected item?'
      : `Are you sure you want to delete ${selectedCount} items?`;

    if (confirm(confirmMessage)) {
      fileSystem.deleteSelected(true);
    }
  }

  function toggleSplitView() {
    settings.toggleSplitView();
  }

  function toggleHiddenFiles() {
    settings.toggleHiddenFiles();
  }
</script>

<div class="toolbar">
  <div class="toolbar-group single-row">
    <button class="toolbar-button" on:click={createNewFolder} title="New Folder">
      <span class="material-symbols-outlined">create_new_folder</span>
    </button>

    <button
      class="toolbar-button"
      on:click={deleteSelected}
      disabled={selectedCount === 0}
      title="Delete"
    >
      <span class="material-symbols-outlined">delete</span>
    </button>

    <button
      class="toolbar-button {$settings.splitView ? 'active' : ''}"
      on:click={toggleSplitView}
      title="Split View"
    >
      <span class="material-symbols-outlined">vertical_split</span>
    </button>

    <button
      class="toolbar-button {$settings.showHiddenFiles ? 'active' : ''}"
      on:click={toggleHiddenFiles}
      title="Show Hidden Files"
    >
      <span class="material-symbols-outlined">visibility</span>
    </button>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    padding: 8px;
    width: 100%;
  }

  .toolbar-group.single-row {
    display: flex;
    flex-direction: row;
    gap: 4px;
    width: 100%;
  }

  .toolbar-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toolbar-button:hover {
    background-color: #e0e0e0;
  }

  .toolbar-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toolbar-button.active {
    background-color: #e3f2fd;
    color: #2196f3;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .toolbar {
      background-color: #252525;
      border-bottom: 1px solid #444;
      color: #eee;
    }

    .toolbar-button {
      color: #eee;
    }

    .toolbar-button:hover {
      background-color: #444;
    }

    .toolbar-button.active {
      background-color: #0d47a1;
      color: #fff;
    }
  }
</style>
