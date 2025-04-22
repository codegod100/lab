<script lang="ts">
  import { settings, type PaneSettings } from '../stores/settings';

  export let pane: 'left' | 'right' = 'left'; // Which pane this file list belongs to

  // Get the settings for this pane
  $: paneSettings = pane === 'left' ? $settings.leftPane : $settings.rightPane;

  // Handle view mode change
  function changeViewMode(mode: PaneSettings['viewMode']) {
    settings.setViewMode(mode, pane);
  }
</script>

<div class="view-mode-controls">
  <button
    class="view-mode-button {paneSettings.viewMode === 'list' ? 'active' : ''}"
    on:click={() => changeViewMode('list')}
    title="List View"
  >
    <span class="material-symbols-outlined">view_list</span>
  </button>
  <button
    class="view-mode-button {paneSettings.viewMode === 'grid' ? 'active' : ''}"
    on:click={() => changeViewMode('grid')}
    title="Grid View"
  >
    <span class="material-symbols-outlined">grid_view</span>
  </button>
  <button
    class="view-mode-button {paneSettings.viewMode === 'details' ? 'active' : ''}"
    on:click={() => changeViewMode('details')}
    title="Details View"
  >
    <span class="material-symbols-outlined">table_rows</span>
  </button>
</div>



<style>
  .view-mode-controls {
    display: flex;
    justify-content: flex-end;
    padding: 4px 8px;
    height: 28px; /* Fixed height for calculations */
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    width: 100%;
  }

  .view-mode-button {
    background: none;
    border: none;
    border-radius: 4px;
    padding: 4px;
    margin-left: 4px;
    cursor: pointer;
  }

  .view-mode-button:hover {
    background-color: #e0e0e0;
  }

  .view-mode-button.active {
    background-color: #e3f2fd;
    color: #1976d2;
  }



  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .view-mode-controls {
      background-color: #252525;
      border-bottom: 1px solid #444;
    }

    .view-mode-button:hover {
      background-color: #444;
    }

    .view-mode-button.active {
      background-color: #0d47a1;
      color: #fff;
    }

    .view-mode-controls {
      background-color: #252525;
      border-bottom: 1px solid #444;
    }
  }
</style>
