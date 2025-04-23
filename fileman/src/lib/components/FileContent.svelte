<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { FileItem } from '../stores/fs';
  import { fileSystem, FileType, type FileSystemState } from '../stores/fs';
  import { settings, type PaneSettings } from '../stores/settings';
  import { formatFileSize, formatDate, getFileIcon, sortFiles, filterFiles } from '../utils/fileUtils';
  import { invoke } from '@tauri-apps/api/core';

  export let items: FileItem[] = [];
  export let selectedItems: Set<string> = new Set();
  export let path: string = '';
  export let fs = fileSystem; // Default to the main file system instance
  export let pane: 'left' | 'right' = 'left'; // Which pane this file list belongs to

  const dispatch = createEventDispatcher();

  // Drag and drop state
  let isDraggingOver = false;
  let draggedItem: FileItem | null = null;

  // Helper function to get platform-specific file path
  async function getPlatformPath(path: string): Promise<string> {
    try {
      // Try to detect the platform using Tauri API
      const platform = await invoke<string>('get_platform').catch(() => {
        // If the command doesn't exist, try to detect platform from the path format
        if (path.match(/^[A-Za-z]:\\/)) {
          return 'windows';
        } else if (path.startsWith('/')) {
          return 'unix';
        } else {
          return 'unknown';
        }
      });

      // Format the path based on the platform
      if (platform === 'windows') {
        // Windows paths need special handling
        return path.replace(/\//g, '\\');
      } else {
        // Unix paths (Linux, macOS)
        return path.startsWith('/') ? path : `/${path}`;
      }
    } catch (e) {
      console.error('Error getting platform path:', e);
      return path; // Return the original path as fallback
    }
  }

  // Get the settings for this pane
  $: paneSettings = pane === 'left' ? $settings.leftPane : $settings.rightPane;

  // Filtered and sorted items
  $: filteredItems = filterFiles(items, $settings.showHiddenFiles);
  $: sortedItems = sortFiles(filteredItems, paneSettings.sortBy, paneSettings.sortDirection);

  // Handle item click
  function handleItemClick(item: FileItem, event: MouseEvent) {
    if (item.file_type === FileType.Directory) {
      fs.navigateTo(item.path);
    } else {
      // Select the item
      fs.selectItem(item.path, event.ctrlKey || event.metaKey);

      // Dispatch open event for files
      dispatch('open', { item, fs });
    }
  }

  // Handle item double click
  function handleItemDoubleClick(item: FileItem) {
    if (item.file_type === FileType.File) {
      dispatch('open', { item });
    }
  }

  // Handle context menu
  function handleContextMenu(item: FileItem, event: MouseEvent) {
    event.preventDefault();

    // If the item is not selected, select it
    if (!selectedItems.has(item.path)) {
      fs.selectItem(item.path, false);
    }

    dispatch('contextmenu', {
      item,
      items: Array.from(selectedItems).map(path =>
        items.find(i => i.path === path)
      ).filter(Boolean),
      x: event.clientX,
      y: event.clientY,
      fs
    });
  }

  // Handle background click (clear selection)
  function handleBackgroundClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      fs.clearSelection();
    }
  }

  // Handle background context menu
  function handleBackgroundContextMenu(event: MouseEvent) {
    event.preventDefault();
    dispatch('backgroundcontextmenu', { x: event.clientX, y: event.clientY, fs });
  }

  // Handle column header click (for sorting)
  function handleColumnHeaderClick(column: 'name' | 'size' | 'type' | 'modified') {
    settings.setSortBy(column, pane);
  }

  // Drag and drop handlers
  async function handleDragStart(event: DragEvent, item: FileItem) {
    if (!event.dataTransfer) return;

    // Set the dragged item
    draggedItem = item;

    // Determine which items are being dragged (the clicked item or all selected items)
    let itemsToDrag: FileItem[] = [];
    if (selectedItems.has(item.path) && selectedItems.size > 1) {
      // If the dragged item is part of a multi-selection, drag all selected items
      const selectedPaths = Array.from(selectedItems);
      itemsToDrag = selectedPaths
        .map(path => items.find(i => i.path === path))
        .filter(Boolean) as FileItem[];
    } else {
      // Otherwise, just drag the single item
      itemsToDrag = [item];
    }

    // Set data for internal operations
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    if (itemsToDrag.length > 1) {
      event.dataTransfer.setData('application/json+items', JSON.stringify(itemsToDrag));
    }

    // Try to get the platform information
    let platform = 'unknown';
    try {
      platform = await invoke<string>('get_platform');
    } catch (e) {
      console.error('Error getting platform:', e);
    }

    // Set data for external applications
    // The most important format for external applications is text/plain with the file path
    const filePaths = itemsToDrag.map(i => i.path).join('\n');
    event.dataTransfer.setData('text/plain', filePaths);

    // For browsers and some applications, set text/uri-list format
    const fileUris = itemsToDrag.map(i => {
      // Get the absolute path
      const path = i.path;

      // Format as a proper file URI based on platform and path format
      if (platform === 'windows' || path.match(/^[A-Za-z]:\\/)) {
        // Windows path (e.g., C:\path\to\file)
        // Make sure to use forward slashes in the URI
        const windowsPath = path.replace(/\//g, '\\');
        return `file:///${windowsPath.replace(/\\/g, '/')}`;
      }

      // Unix path (ensure it starts with a slash)
      const unixPath = path.startsWith('/') ? path : `/${path}`;
      return `file://${unixPath}`;
    }).join('\r\n');
    event.dataTransfer.setData('text/uri-list', fileUris);

    // Set the drag effect - allow both copy and move operations
    event.dataTransfer.effectAllowed = 'copyMove';

    // Create a custom drag image
    try {
      const dragImage = document.createElement('div');
      dragImage.className = 'drag-image';

      // For multiple items, show a count badge
      if (itemsToDrag.length > 1) {
        dragImage.innerHTML = `
          <span class="material-symbols-outlined icon">${getFileIcon(item)}</span>
          <span class="badge">${itemsToDrag.length}</span>
        `;
      } else {
        // For a single item, just show the icon and name
        dragImage.innerHTML = `
          <span class="material-symbols-outlined icon">${getFileIcon(item)}</span>
          <span class="name">${item.name}</span>
        `;
      }

      // Add to document, position off-screen, and use as drag image
      document.body.appendChild(dragImage);
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.left = '-1000px';
      dragImage.style.zIndex = '-1';

      // Apply styles to make it visible for setDragImage
      dragImage.style.padding = '8px';
      dragImage.style.background = '#f5f5f5';
      dragImage.style.borderRadius = '4px';
      dragImage.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

      // Set as drag image and remove after a short delay
      event.dataTransfer.setDragImage(dragImage, 15, 15);
      setTimeout(() => {
        if (dragImage.parentNode) {
          document.body.removeChild(dragImage);
        }
      }, 100);
    } catch (e) {
      console.error('Error setting drag image:', e);
      // If setting a custom drag image fails, the browser will use a default one
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();

    if (!event.dataTransfer) return;

    // Set the drop effect based on modifier keys
    // Ctrl/Cmd key for copy, otherwise move
    const isCopyOperation = event.ctrlKey || event.metaKey;
    event.dataTransfer.dropEffect = isCopyOperation ? 'copy' : 'move';

    // Accept all types of drops including files from outside
    isDraggingOver = true;
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    isDraggingOver = true;

    // Accept all types of drops including files from outside
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  function handleDragLeave() {
    isDraggingOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDraggingOver = false;

    if (!event.dataTransfer) return;

    // Prevent default browser behavior for file drops
    event.stopPropagation();

    // Determine if this is a copy or move operation
    const isCopyOperation = event.ctrlKey || event.metaKey;

    // Handle drop from the same file manager
    if (draggedItem) {
      // Get all selected items if the dragged item is part of the selection
      let itemsToProcess: FileItem[] = [];

      if (selectedItems.has(draggedItem.path)) {
        itemsToProcess = Array.from(selectedItems)
          .map(path => items.find(i => i.path === path))
          .filter(Boolean) as FileItem[];
      } else {
        itemsToProcess = [draggedItem];
      }

      // Process the drop operation
      // First, select all the items we want to process
      fs.clearSelection();
      for (const item of itemsToProcess) {
        fs.selectItem(item.path, true);
      }

      // Then perform the operation
      if (isCopyOperation) {
        // Copy operation
        fs.copySelected(path);
      } else {
        // Move operation
        fs.moveSelected(path);
      }

      draggedItem = null;
      return;
    }

    // Handle drop from external sources
    // Check if files were dropped from outside the application
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleExternalFileDrop(event.dataTransfer.files, path);
    }
  }
  // Handle files dropped from outside the application
  async function handleExternalFileDrop(files: FileList, targetPath: string) {
    // In Tauri, handling files dropped from outside the application requires
    // additional setup and permissions. For now, we'll just show a message
    // explaining that this feature is not yet implemented.

    console.log(`Received ${files.length} files to copy to ${targetPath}`);

    // Show a message to the user
    alert(`Received ${files.length} files. External file drops from outside the application are not implemented in this version.`);

    // Refresh the directory to show any changes (though none are expected)
    await fs.refreshCurrentDirectory();
  }
</script>

<div class="file-content-wrapper" style="height: 500px; overflow: auto;">
<section
  class="file-list {paneSettings.viewMode} {isDraggingOver ? 'drag-over' : ''}"
  aria-label="File list"
  on:dragover={handleDragOver}
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <!-- Keyboard accessible overlay for background interactions -->
  <div
    class="file-list-overlay"
    on:click={handleBackgroundClick}
    on:keydown={(e) => e.key === 'Escape' && fs.clearSelection()}
    on:contextmenu={handleBackgroundContextMenu}
    tabindex="0"
    role="grid"
  ></div>
{#if paneSettings.viewMode === 'details'}
  <table>
    <colgroup>
      <col class="col-name">
      <col class="col-size" width="80px">
      <col class="col-type" width="100px">
      <col class="col-modified" width="180px">
    </colgroup>
    <thead>
      <tr>
        <th class="name-column" on:click={() => handleColumnHeaderClick('name')}>
          Name
          {#if paneSettings.sortBy === 'name'}
            <span class="sort-indicator">{paneSettings.sortDirection === 'asc' ? '↑' : '↓'}</span>
          {/if}
        </th>
        <th class="size-column" on:click={() => handleColumnHeaderClick('size')}>
          Size
          {#if paneSettings.sortBy === 'size'}
            <span class="sort-indicator">{paneSettings.sortDirection === 'asc' ? '↑' : '↓'}</span>
          {/if}
        </th>
        <th class="type-column" on:click={() => handleColumnHeaderClick('type')}>
          Type
          {#if paneSettings.sortBy === 'type'}
            <span class="sort-indicator">{paneSettings.sortDirection === 'asc' ? '↑' : '↓'}</span>
          {/if}
        </th>
        <th class="modified-column" on:click={() => handleColumnHeaderClick('modified')}>
          Modified
          {#if paneSettings.sortBy === 'modified'}
            <span class="sort-indicator">{paneSettings.sortDirection === 'asc' ? '↑' : '↓'}</span>
          {/if}
        </th>
      </tr>
    </thead>
    <tbody>
      {#each sortedItems as item (item.path)}
        <tr
          class:selected={selectedItems.has(item.path)}
          on:click={(e) => handleItemClick(item, e)}
          on:dblclick={() => handleItemDoubleClick(item)}
          on:contextmenu={(e) => handleContextMenu(item, e)}
          on:dragstart={(e) => handleDragStart(e, item)}
          draggable="true"
          title={item.name}
        >
          <td class="name-column">
            <span class="material-symbols-outlined icon">{getFileIcon(item)}</span>
            <span class="name">{item.name}</span>
          </td>
          <td class="size-column">
            <span>{item.file_type === FileType.Directory ? '--' : formatFileSize(item.size)}</span>
          </td>
          <td class="type-column">
            <span>{item.file_type === FileType.Directory ? 'Folder' : item.name.split('.').pop() || 'File'}</span>
          </td>
          <td class="modified-column">
            <span>{item.modified ? formatDate(item.modified) : '--'}</span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else if paneSettings.viewMode === 'grid'}
  <div class="grid-container">
    {#each sortedItems as item (item.path)}
      <div
        class="grid-item {item.file_type.toLowerCase()} {selectedItems.has(item.path) ? 'selected' : ''}"
        on:click={(e) => handleItemClick(item, e)}
        on:dblclick={() => handleItemDoubleClick(item)}
        on:contextmenu={(e) => handleContextMenu(item, e)}
        on:dragstart={(e) => handleDragStart(e, item)}
        on:keydown={(e) => e.key === 'Enter' && handleItemDoubleClick(item)}
        draggable="true"
        role="button"
        tabindex="0"
      >
        <span class="material-symbols-outlined icon">{getFileIcon(item)}</span>
        <span class="name">{item.name}</span>
      </div>
    {/each}
  </div>
{:else}
  <div class="list-container">
    {#each sortedItems as item (item.path)}
      <div
        class="list-item {item.file_type.toLowerCase()} {selectedItems.has(item.path) ? 'selected' : ''}"
        on:click={(e) => handleItemClick(item, e)}
        on:dblclick={() => handleItemDoubleClick(item)}
        on:dragstart={(e) => handleDragStart(e, item)}
        on:keydown={(e) => e.key === 'Enter' && handleItemDoubleClick(item)}
        draggable="true"
        role="button"
        tabindex="0"
        on:contextmenu={(e) => handleContextMenu(item, e)}
      >
        <span class="material-symbols-outlined icon">{getFileIcon(item)}</span>
        <span class="name">{item.name}</span>
      </div>
    {/each}
  </div>
{/if}

{#if sortedItems.length === 0}
  <div class="empty-state">
    <span class="material-symbols-outlined">folder_off</span>
    <p>This folder is empty</p>
  </div>
{/if}
</section>
</div>

<style>
  /* Overlay for keyboard accessibility */
  .file-list-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    opacity: 0;
  }

  /* Drag image styles */
  .drag-image {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .drag-image .icon {
    font-size: 24px;
    color: #1976d2;
  }

  .drag-image .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #f44336;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  /* Dark mode for drag image */
  @media (prefers-color-scheme: dark) {
    .drag-image {
      background-color: #333;
    }

    .drag-image .icon {
      color: #42a5f5;
    }
  }

  /* Drag and drop styles */
  .drag-over {
    background-color: rgba(25, 118, 210, 0.1);
    border: 2px dashed #1976d2;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .drag-over {
      background-color: rgba(66, 165, 245, 0.1);
      border: 2px dashed #42a5f5;
    }
  }

  .file-content-wrapper {
    width: 100%;
    overflow: auto;
  }

  .file-list {
    background-color: #fff;
    color: #333;
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  /* Details view (table) */
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; /* Fixed table layout for better column control */
  }

  th {
    text-align: left;
    padding: 8px;
    border-bottom: 1px solid #ddd;
    user-select: none;
    cursor: pointer;
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 5;
  }

  th:hover {
    background-color: #f5f5f5;
  }

  td {
    padding: 8px;
    border-bottom: 1px solid #eee;
  }

  tr:hover {
    background-color: #f5f5f5;
  }

  tr.selected {
    background-color: #e3f2fd;
  }

  .name-column {
    display: flex;
    align-items: center;
    gap: 8px;
    width: auto; /* Let name column take remaining space */
    min-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .name-column .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .size-column {
    width: 80px;
    text-align: right;
  }

  .size-column span {
    display: block;
    text-align: right;
  }

  .type-column {
    width: 100px;
  }

  .type-column span {
    display: block;
  }

  .modified-column {
    width: 180px;
  }

  .modified-column span {
    display: block;
  }

  /* Ensure all cells have consistent padding and overflow handling */
  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Ensure column headers are properly aligned with their data */
  th.size-column {
    text-align: right;
  }

  /* Add some spacing between rows for better readability */
  tr {
    height: 32px;
  }

  /* Ensure the table header stays fixed when scrolling */
  thead {
    position: sticky;
    top: 0;
    z-index: 5;
  }

  /* Grid view */
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
    padding: 16px;
  }

  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
  }

  .grid-item:hover {
    background-color: #f5f5f5;
  }

  .grid-item.selected {
    background-color: #e3f2fd;
  }

  .grid-item .icon {
    font-size: 48px;
    margin-bottom: 8px;
  }

  .grid-item .name {
    text-align: center;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  /* List view */
  .list-container {
    display: flex;
    flex-direction: column;
  }

  .list-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    user-select: none;
  }

  .list-item:hover {
    background-color: #f5f5f5;
  }

  .list-item.selected {
    background-color: #e3f2fd;
  }

  .list-item .icon {
    margin-right: 8px;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
  }

  .empty-state .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: 16px;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .file-list {
      background-color: #1e1e1e;
      color: #eee;
    }

    th {
      border-bottom: 1px solid #444;
      background-color: #1e1e1e;
    }

    td {
      border-bottom: 1px solid #333;
    }

    th:hover {
      background-color: #2a2a2a;
    }

    tr:hover {
      background-color: #2a2a2a;
    }

    tr.selected {
      background-color: #0d47a1;
    }

    .grid-item:hover {
      background-color: #2a2a2a;
    }

    .grid-item.selected {
      background-color: #0d47a1;
    }

    .list-item:hover {
      background-color: #2a2a2a;
    }

    .list-item.selected {
      background-color: #0d47a1;
    }
  }
</style>
