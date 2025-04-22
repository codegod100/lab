<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import SplitPane from '../lib/components/SplitPane.svelte';
  import Sidebar from '../lib/components/Sidebar.svelte';
  import FileList from '../lib/components/FileList.svelte';
  import PathBar from '../lib/components/PathBar.svelte';
  import Toolbar from '../lib/components/Toolbar.svelte';
  import ContextMenu from '../lib/components/ContextMenu.svelte';
  import { fileSystem, type FileItem } from '../lib/stores/fs';
  import { settings } from '../lib/stores/settings';

  // State for context menu
  let contextMenuVisible = $state(false);
  let contextMenuX = $state(0);
  let contextMenuY = $state(0);
  let contextMenuItems = $state<FileItem[]>([]);
  let isBackgroundContextMenu = $state(false);

  // State for clipboard
  let clipboardItems = $state<FileItem[]>([]);
  let clipboardOperation = $state<'cut' | 'copy' | null>(null);

  // Initialize file system on mount
  onMount(() => {
    fileSystem.init();

    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  // Handle keyboard shortcuts
  function handleKeyDown(event: KeyboardEvent) {
    // Only handle if not in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Ctrl+C: Copy
    if (event.ctrlKey && event.key === 'c') {
      if ($fileSystem.selectedItems.size > 0) {
        handleCopy();
      }
    }

    // Ctrl+X: Cut
    if (event.ctrlKey && event.key === 'x') {
      if ($fileSystem.selectedItems.size > 0) {
        handleCut();
      }
    }

    // Ctrl+V: Paste
    if (event.ctrlKey && event.key === 'v') {
      if (clipboardItems.length > 0) {
        handlePaste();
      }
    }

    // Delete: Delete selected items
    if (event.key === 'Delete') {
      if ($fileSystem.selectedItems.size > 0) {
        handleDelete();
      }
    }

    // F2: Rename
    if (event.key === 'F2') {
      if ($fileSystem.selectedItems.size === 1) {
        const selectedPath = Array.from($fileSystem.selectedItems)[0];
        const item = $fileSystem.items.find(i => i.path === selectedPath);
        if (item) {
          handleRename(item);
        }
      }
    }

    // F5: Refresh
    if (event.key === 'F5') {
      fileSystem.refreshCurrentDirectory();
    }
  }

  // Handle file open
  async function handleFileOpen(event: CustomEvent) {
    const { item } = event.detail;

    try {
      await invoke('plugin:opener:open', { path: item.path });
    } catch (error) {
      console.error('Failed to open file:', error);
      alert(`Failed to open file: ${error}`);
    }
  }

  // Handle context menu for items
  function handleContextMenu(event: CustomEvent) {
    const { items, x, y } = event.detail;

    contextMenuItems = items;
    contextMenuX = x;
    contextMenuY = y;
    contextMenuVisible = true;
    isBackgroundContextMenu = false;
  }

  // Handle context menu for background
  function handleBackgroundContextMenu(event: CustomEvent) {
    const { x, y } = event.detail;

    contextMenuItems = [];
    contextMenuX = x;
    contextMenuY = y;
    contextMenuVisible = true;
    isBackgroundContextMenu = true;
  }

  // Handle cut operation
  function handleCut(event?: CustomEvent) {
    const items = event?.detail?.items ||
      Array.from($fileSystem.selectedItems)
        .map(path => $fileSystem.items.find(i => i.path === path))
        .filter(Boolean) as FileItem[];

    if (items.length > 0) {
      clipboardItems = items;
      clipboardOperation = 'cut';
    }
  }

  // Handle copy operation
  function handleCopy(event?: CustomEvent) {
    const items = event?.detail?.items ||
      Array.from($fileSystem.selectedItems)
        .map(path => $fileSystem.items.find(i => i.path === path))
        .filter(Boolean) as FileItem[];

    if (items.length > 0) {
      clipboardItems = items;
      clipboardOperation = 'copy';
    }
  }

  // Handle paste operation
  async function handlePaste() {
    if (clipboardItems.length === 0 || !clipboardOperation) return;

    try {
      if (clipboardOperation === 'cut') {
        await fileSystem.moveSelected($fileSystem.currentPath);
      } else {
        await fileSystem.copySelected($fileSystem.currentPath);
      }

      // Clear clipboard after cut operation
      if (clipboardOperation === 'cut') {
        clipboardItems = [];
        clipboardOperation = null;
      }
    } catch (error) {
      console.error('Failed to paste items:', error);
      alert(`Failed to paste items: ${error}`);
    }
  }

  // Handle delete operation
  function handleDelete() {
    if ($fileSystem.selectedItems.size === 0) return;

    const confirmMessage = $fileSystem.selectedItems.size === 1
      ? 'Are you sure you want to delete the selected item?'
      : `Are you sure you want to delete ${$fileSystem.selectedItems.size} items?`;

    if (confirm(confirmMessage)) {
      fileSystem.deleteSelected(true);
    }
  }

  // Handle rename operation
  function handleRename(item: FileItem) {
    const newName = prompt('Enter new name:', item.name);
    if (newName && newName !== item.name) {
      fileSystem.renameItem(item.path, newName);
    }
  }
</script>

<main class="file-manager">
  <div class="app-layout">
    {#if $settings.splitView}
      <SplitPane direction="horizontal" initialSplit={20}>
        <div slot="first" class="sidebar-container">
          <Sidebar />
        </div>

        <div slot="second" class="content-container">
          <div class="toolbar-container">
            <Toolbar selectedCount={$fileSystem.selectedItems.size} />
          </div>

          <div class="path-bar-container">
            <PathBar path={$fileSystem.currentPath} />
          </div>

          <SplitPane direction="horizontal" initialSplit={50}>
            <div slot="first" class="file-list-container">
              <FileList
                items={$fileSystem.items}
                selectedItems={$fileSystem.selectedItems}
                path={$fileSystem.currentPath}
                on:open={handleFileOpen}
                on:contextmenu={handleContextMenu}
                on:backgroundcontextmenu={handleBackgroundContextMenu}
              />
            </div>

            <div slot="second" class="file-list-container">
              <FileList
                items={$fileSystem.items}
                selectedItems={$fileSystem.selectedItems}
                path={$fileSystem.currentPath}
                on:open={handleFileOpen}
                on:contextmenu={handleContextMenu}
                on:backgroundcontextmenu={handleBackgroundContextMenu}
              />
            </div>
          </SplitPane>
        </div>
      </SplitPane>
    {:else}
      <SplitPane direction="horizontal" initialSplit={20}>
        <div slot="first" class="sidebar-container">
          <Sidebar />
        </div>

        <div slot="second" class="content-container">
          <div class="toolbar-container">
            <Toolbar selectedCount={$fileSystem.selectedItems.size} />
          </div>

          <div class="path-bar-container">
            <PathBar path={$fileSystem.currentPath} />
          </div>

          <div class="file-list-container">
            <FileList
              items={$fileSystem.items}
              selectedItems={$fileSystem.selectedItems}
              path={$fileSystem.currentPath}
              on:open={handleFileOpen}
              on:contextmenu={handleContextMenu}
              on:backgroundcontextmenu={handleBackgroundContextMenu}
            />
          </div>
        </div>
      </SplitPane>
    {/if}
  </div>

  <ContextMenu
    visible={contextMenuVisible}
    x={contextMenuX}
    y={contextMenuY}
    items={contextMenuItems}
    isBackground={isBackgroundContextMenu}
    on:close={() => contextMenuVisible = false}
    on:cut={handleCut}
    on:copy={handleCopy}
    on:paste={handlePaste}
    on:open={handleFileOpen}
  />
</main>

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  :global(body) {
    background-color: #f6f6f6;
    color: #333;
  }

  :global(.material-symbols-outlined) {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }

  .file-manager {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .app-layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .sidebar-container {
    height: 100%;
    overflow: hidden;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .toolbar-container {
    flex-shrink: 0;
  }

  .path-bar-container {
    flex-shrink: 0;
  }

  .file-list-container {
    flex: 1;
    overflow: hidden;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    :global(body) {
      background-color: #1e1e1e;
      color: #eee;
    }
  }
</style>
