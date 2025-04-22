<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { FileItem } from '../stores/fs';
  import { fileSystem, FileType, type FileSystemState } from '../stores/fs';
  import { settings, type PaneSettings } from '../stores/settings';
  import { formatFileSize, formatDate, getFileIcon, sortFiles, filterFiles } from '../utils/fileUtils';

  export let items: FileItem[] = [];
  export let selectedItems: Set<string> = new Set();
  export let path: string = '';
  export let fs = fileSystem; // Default to the main file system instance
  export let pane: 'left' | 'right' = 'left'; // Which pane this file list belongs to

  const dispatch = createEventDispatcher();

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
</script>

<div class="file-content-wrapper" style="height: 500px; overflow: auto;">
<div
  class="file-list {paneSettings.viewMode}"
  role="region"
  aria-label="File list"
  on:click={handleBackgroundClick}
  on:keydown={() => {}}
  on:contextmenu={handleBackgroundContextMenu}
>
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
</div>
</div>

<style>
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
