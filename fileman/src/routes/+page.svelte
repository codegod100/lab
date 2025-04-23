<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { openPath } from '@tauri-apps/plugin-opener';
  import SplitPane from '../lib/components/SplitPane.svelte';
  import Sidebar from '../lib/components/Sidebar.svelte';
  import FileList from '../lib/components/FileList.svelte';
  import FileContent from '../lib/components/FileContent.svelte';
  import PathBar from '../lib/components/PathBar.svelte';
  import ContextMenu from '../lib/components/ContextMenu.svelte';
  import AppLayout from '../lib/components/AppLayout.svelte';
  import { fileSystem, leftPaneFS, rightPaneFS, type FileItem } from '../lib/stores/fs';
  import { get } from 'svelte/store';
  import { settings } from '../lib/stores/settings';

  // State for context menu
  let contextMenuVisible = false;
  let contextMenuX = 0;
  let contextMenuY = 0;
  let contextMenuItems: FileItem[] = [];
  let isBackgroundContextMenu = false;

  // State for clipboard and active file system
  let clipboardItems: FileItem[] = [];
  let clipboardOperation: 'cut' | 'copy' | null = null;
  let activeFS = leftPaneFS; // Track which file system is active for context menu operations

  // Initialize file systems on mount
  onMount(() => {
    // Initialize both file system instances
    leftPaneFS.init();
    rightPaneFS.init();

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
      // Use the active file system or check both if none is active
      const fsState = get(activeFS || leftPaneFS);
      if (fsState.selectedItems.size === 1) {
        const selectedPath = Array.from(fsState.selectedItems)[0];
        const item = fsState.items.find(i => i.path === selectedPath);
        if (item) {
          handleRename(item);
        }
      } else if (!activeFS) {
        // If no active FS and nothing selected in left pane, try right pane
        const rightState = get(rightPaneFS);
        if (rightState.selectedItems.size === 1) {
          const selectedPath = Array.from(rightState.selectedItems)[0];
          const item = rightState.items.find(i => i.path === selectedPath);
          if (item) {
            activeFS = rightPaneFS;
            handleRename(item);
          }
        }
      }
    }

    // F5: Refresh
    if (event.key === 'F5') {
      // Refresh the active file system or both if none is active
      if (activeFS) {
        activeFS.refreshCurrentDirectory();
      } else {
        leftPaneFS.refreshCurrentDirectory();
        rightPaneFS.refreshCurrentDirectory();
      }
    }
  }

  // Handle file open
  async function handleFileOpen(event: CustomEvent) {
    const { item } = event.detail;

    try {
      // Open the file with the system's default application
      await openPath(item.path);
    } catch (error) {
      console.error('Failed to open file:', error);
      alert(`Failed to open file: ${error}`);
    }
  }

  // Handle context menu for items
  function handleContextMenu(event: CustomEvent) {
    const { items, x, y, fs } = event.detail;

    contextMenuItems = items;
    contextMenuX = x;
    contextMenuY = y;
    contextMenuVisible = true;
    isBackgroundContextMenu = false;

    // Store the active file system for context menu operations
    activeFS = fs || leftPaneFS;
  }

  // Handle context menu for background
  function handleBackgroundContextMenu(event: CustomEvent) {
    const { x, y, fs } = event.detail;

    contextMenuItems = [];
    contextMenuX = x;
    contextMenuY = y;
    contextMenuVisible = true;
    isBackgroundContextMenu = true;

    // Store the active file system for context menu operations
    activeFS = fs || leftPaneFS;
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
      const currentPath = get(activeFS).currentPath;
      if (clipboardOperation === 'cut') {
        await activeFS.moveSelected(currentPath);
      } else {
        await activeFS.copySelected(currentPath);
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
    const state = get(activeFS);
    if (state.selectedItems.size === 0) return;

    const confirmMessage = state.selectedItems.size === 1
      ? 'Are you sure you want to delete the selected item?'
      : `Are you sure you want to delete ${state.selectedItems.size} items?`;

    if (confirm(confirmMessage)) {
      activeFS.deleteSelected(true);
    }
  }

  // Handle rename operation
  function handleRename(item: FileItem) {
    const newName = prompt('Enter new name:', item.name);
    if (newName && newName !== item.name) {
      activeFS.renameItem(item.path, newName);
    }
  }
</script>

<AppLayout
  contextMenuVisible={contextMenuVisible}
  contextMenuX={contextMenuX}
  contextMenuY={contextMenuY}
  contextMenuItems={contextMenuItems}
  isBackgroundContextMenu={isBackgroundContextMenu}
  onContextMenuClose={() => contextMenuVisible = false}
  onCut={handleCut}
  onCopy={handleCopy}
  onPaste={handlePaste}
  onOpen={handleFileOpen}
>
  <div class="file-manager">
    {#if $settings.splitView}
      <SplitPane direction="horizontal" initialSplit={15}>
        <div slot="first" class="sidebar-container">
          <Sidebar />
        </div>

        <div slot="second" class="content-container">
          <SplitPane direction="horizontal" initialSplit={50}>
            <div slot="first" class="split-pane-container">
              <div class="pane-fixed-header">
                <div class="path-bar-container">
                  <PathBar path={$leftPaneFS.currentPath} fs={leftPaneFS} />
                </div>
              </div>
              <div class="pane-fixed-controls">
                <FileList pane="left" />
              </div>
              <div class="pane-scrollable-content" style="height: calc(100% - 76px);">
                <FileContent
                  items={$leftPaneFS.items}
                  selectedItems={$leftPaneFS.selectedItems}
                  path={$leftPaneFS.currentPath}
                  fs={leftPaneFS}
                  pane="left"
                  on:open={handleFileOpen}
                  on:contextmenu={handleContextMenu}
                  on:backgroundcontextmenu={handleBackgroundContextMenu}
                />
              </div>
            </div>

            <div slot="second" class="split-pane-container">
              <div class="pane-fixed-header">
                <div class="path-bar-container">
                  <PathBar path={$rightPaneFS.currentPath} fs={rightPaneFS} />
                </div>
              </div>
              <div class="pane-fixed-controls">
                <FileList pane="right" />
              </div>
              <div class="pane-scrollable-content" style="height: calc(100% - 76px);">
                <FileContent
                  items={$rightPaneFS.items}
                  selectedItems={$rightPaneFS.selectedItems}
                  path={$rightPaneFS.currentPath}
                  fs={rightPaneFS}
                  pane="right"
                  on:open={handleFileOpen}
                  on:contextmenu={handleContextMenu}
                  on:backgroundcontextmenu={handleBackgroundContextMenu}
                />
              </div>
            </div>
          </SplitPane>
        </div>
      </SplitPane>
    {:else}
      <SplitPane direction="horizontal" initialSplit={15}>
        <div slot="first" class="sidebar-container">
          <Sidebar />
        </div>

        <div slot="second" class="content-container">
          <div class="pane-fixed-header">
            <div class="path-bar-container">
              <PathBar path={$leftPaneFS.currentPath} fs={leftPaneFS} />
            </div>
          </div>
          <div class="pane-fixed-controls">
            <FileList pane="left" />
          </div>

          <div class="pane-scrollable-content" style="height: calc(100% - 76px);">
            <FileContent
              items={$leftPaneFS.items}
              selectedItems={$leftPaneFS.selectedItems}
              path={$leftPaneFS.currentPath}
              fs={leftPaneFS}
              pane="left"
              on:open={handleFileOpen}
              on:contextmenu={handleContextMenu}
              on:backgroundcontextmenu={handleBackgroundContextMenu}
            />
          </div>
        </div>
      </SplitPane>
    {/if}
  </div>

</AppLayout>

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

  /* Remove any potential white borders */
  :global(#app) {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
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
    height: 100%;
    width: 100%;
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
    position: relative;
    overflow: visible;
  }

  .split-pane-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #f6f6f6;
    position: relative;
    overflow: visible;
  }

  .pane-fixed-header {
    flex-shrink: 0;
    position: relative;
    z-index: 10;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  .path-bar-container {
    flex-shrink: 0;
    background-color: #f5f5f5;
  }

  .pane-fixed-controls {
    flex-shrink: 0;
    position: relative;
    z-index: 10;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  .pane-fixed-controls :global(.view-mode-controls) {
    border-bottom: none;
  }

  .pane-scrollable-content {
    flex: 1;
    overflow: hidden;
    background-color: #fff;
    position: relative;
    z-index: 1; /* Ensure content is below fixed headers */
    min-height: 100px; /* Ensure there's enough space for the file list */
  }



  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    :global(body) {
      background-color: #1e1e1e;
      color: #eee;
    }

    .split-pane-container {
      background-color: #1e1e1e;
    }

    .pane-fixed-header {
      background-color: #252525;
      border-bottom: 1px solid #444;
    }

    .path-bar-container {
      background-color: #252525;
    }

    .pane-fixed-controls {
      background-color: #252525;
      border-bottom: 1px solid #444;
    }

    .pane-scrollable-content {
      background-color: #1e1e1e;
    }
  }
</style>
