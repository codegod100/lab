<script lang="ts">
  import Toolbar from './Toolbar.svelte';
  import ContextMenu from './ContextMenu.svelte';
  import { leftPaneFS, rightPaneFS } from '../stores/fs';
  import { settings } from '../stores/settings';

  import type { FileItem } from '../stores/fs';

  // Context menu props
  export let contextMenuVisible = false;
  export let contextMenuX = 0;
  export let contextMenuY = 0;
  export let contextMenuItems: FileItem[] = [];
  export let isBackgroundContextMenu = false;

  // Event handlers
  export let onContextMenuClose: () => void;
  export let onCut: (event?: CustomEvent) => void;
  export let onCopy: (event?: CustomEvent) => void;
  export let onPaste: () => void;
  export let onOpen: (event?: CustomEvent) => Promise<void>;
</script>

<div class="app-layout">
  <div class="toolbar-area">
    <Toolbar selectedCount={$settings.splitView ? $leftPaneFS.selectedItems.size + $rightPaneFS.selectedItems.size : $leftPaneFS.selectedItems.size} />
  </div>

  <div class="content-area">
    <slot />
  </div>

  {#if contextMenuVisible}
    <ContextMenu
      visible={contextMenuVisible}
      x={contextMenuX}
      y={contextMenuY}
      items={contextMenuItems}
      isBackground={isBackgroundContextMenu}
      on:close={onContextMenuClose}
      on:cut={onCut}
      on:copy={onCopy}
      on:paste={onPaste}
      on:open={onOpen}
    />
  {/if}
</div>

<style>
  .app-layout {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .toolbar-area {
    grid-row: 1;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    z-index: 100;
  }

  .content-area {
    grid-row: 2;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .toolbar-area {
      background-color: #252525;
      border-bottom: 1px solid #444;
    }
  }
</style>
