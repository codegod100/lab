<script lang="ts">
  import PathBar from './PathBar.svelte';
  import FileList from './FileList.svelte';
  import FileContent from './FileContent.svelte';
  import { settings, type PaneSettings } from '../stores/settings';
  import { leftPaneFS, rightPaneFS } from '../stores/fs';
  import type { FileItem, FileSystemStore } from '../stores/fs';

  export let pane: 'left' | 'right' = 'left';
  export let fs: FileSystemStore;
  export let items: FileItem[] = [];
  export let selectedItems: Set<string> = new Set();
  export let currentPath: string = '';

  // Event handlers (all optional)
  export let onOpen: (e: CustomEvent) => void = () => {};
  export let onContextMenu: (e: CustomEvent) => void = () => {};
  export let onBackgroundContextMenu: (e: CustomEvent) => void = () => {};

  $: paneSettings = pane === 'left' ? $settings.leftPane : $settings.rightPane;
  // Use the correct filtered items for each pane
  $: items = pane === 'left'
    ? leftPaneFS.getSearchQuery && leftPaneFS.getSearchQuery() ? $leftPaneFS.items.filter(item => item.name.toLowerCase().includes(leftPaneFS.getSearchQuery().toLowerCase())) : $leftPaneFS.items
    : rightPaneFS.getSearchQuery && rightPaneFS.getSearchQuery() ? $rightPaneFS.items.filter(item => item.name.toLowerCase().includes(rightPaneFS.getSearchQuery().toLowerCase())) : $rightPaneFS.items;
</script>

<div class="file-pane-root">
  <div class="pane-fixed-header">
    <div class="path-bar-container">
      <PathBar path={currentPath} fs={fs} />
    </div>
  </div>
  <div class="pane-fixed-controls">
    <FileList pane={pane} />
  </div>
  <div class="pane-scrollable-content">
    <FileContent
      {items}
      {selectedItems}
      path={currentPath}
      {fs}
      {pane}
      on:open={onOpen}
      on:contextmenu={onContextMenu}
      on:backgroundcontextmenu={onBackgroundContextMenu}
    />
  </div>
</div>

<style>
  .file-pane-root {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    height: 100%;
    width: 100%;
    background: transparent;
  }
  .pane-fixed-header {
    flex-shrink: 0;
    position: relative;
    z-index: 10;
    background-color: var(--pane-header-bg, #f5f5f5);
    border-bottom: 1px solid #ddd;
  }
  .path-bar-container {
    flex-shrink: 0;
    background-color: inherit;
  }
  .pane-fixed-controls {
    flex-shrink: 0;
    position: relative;
    z-index: 10;
    background-color: var(--pane-header-bg, #f5f5f5);
    border-bottom: 1px solid #ddd;
  }
  .pane-fixed-controls :global(.view-mode-controls) {
    border-bottom: none;
  }
  .pane-scrollable-content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    background-color: #fff;
    position: relative;
    z-index: 1;
  }
  @media (prefers-color-scheme: dark) {
    .pane-fixed-header, .pane-fixed-controls {
      background-color: #252525;
      border-bottom: 1px solid #444;
    }
    .pane-scrollable-content {
      background-color: #1e1e1e;
    }
  }
</style>
