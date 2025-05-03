<script lang="ts">
  import Toolbar from './Toolbar.svelte';
  import ContextMenu from './ContextMenu.svelte';
  import Sidebar from './Sidebar.svelte';
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

  <div class="main-area">
    <aside class="sidebar-area">
      <Sidebar />
    </aside>
    <div class="content-area">
      <slot />
    </div>
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

  .main-area {
    grid-row: 2;
    display: flex;
    height: 100%;
    min-height: 0;
    width: 100%;
    overflow: hidden;
    background: #f5f5f5;
  }

  .sidebar-area {
    width: 220px;
    min-width: 160px;
    max-width: 320px;
    flex-shrink: 0;
    height: 100%;
    border-right: 1px solid #ddd;
    background: #f5f5f5;
    z-index: 10;
    overflow-y: auto;
    box-sizing: border-box;
    padding-bottom: 0;
    padding-top: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .content-area {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    background: #fff;
    margin: 0;
    padding: 0;
  }

  :global(body), .app-layout {
    margin: 0;
    padding: 0;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .toolbar-area {
      background-color: #252525;
      border-bottom: 1px solid #444;
    }
    .sidebar-area {
      background-color: #252525;
      border-right: 1px solid #444;
    }
    .main-area {
      background: #181818;
    }
    .content-area {
      background: #181818;
    }
  }
</style>
