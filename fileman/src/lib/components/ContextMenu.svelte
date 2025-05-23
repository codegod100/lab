<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { FileItem } from '../stores/fs';
  import { fileSystem, FileType } from '../stores/fs';
  import { invoke } from '@tauri-apps/api/core';

  export let x = 0;
  export let y = 0;
  export let items: FileItem[] = [];
  export let visible = false;
  export let isBackground = false;

  const dispatch = createEventDispatcher();

  let menu: HTMLElement;
  let menuWidth = 0;
  let menuHeight = 0;

  // Adjust position to ensure menu stays within viewport
  $: adjustedX = Math.min(x, window.innerWidth - menuWidth);
  $: adjustedY = Math.min(y, window.innerHeight - menuHeight);

  // Single item for convenience
  $: item = items.length === 1 ? items[0] : null;

  // Determine if all selected items are directories
  $: allDirectories = items.length > 0 && items.every(i => i.file_type === FileType.Directory);

  // Determine if all selected items are files
  $: allFiles = items.length > 0 && items.every(i => i.file_type === FileType.File);

  // Handle menu item clicks
  function handleOpen() {
    if (item) {
      // Also call fileSystem.openItem if available
      if (typeof fileSystem.openItem === 'function') {
        fileSystem.openItem(item.path);
      }
      dispatch('open', { item });
    }
    closeMenu();
  }

  function handleCut() {
    dispatch('cut', { items });
    closeMenu();
  }

  function handleCopy() {
    dispatch('copy', { items });
    closeMenu();
  }

  function handleCopyPath() {
    if (items.length > 0) {
      const paths = items.map(item => item.path);

      // Call the Rust function for logging purposes
      invoke('copy_paths_to_clipboard', { paths })
        .then(() => {
          console.log('Copied paths to clipboard');

          // Show a brief notification
          const notification = document.createElement('div');
          notification.className = 'notification';
          notification.textContent = 'Path copied to clipboard';
          document.body.appendChild(notification);
          setTimeout(() => {
            if (notification.parentNode) {
              document.body.removeChild(notification);
            }
          }, 2000);

          // Use the browser's clipboard API if available
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(paths.join('\n'))
              .then(() => console.log('Copied using browser API'))
              .catch(clipErr => console.error('Browser clipboard failed:', clipErr));
          }
        })
        .catch(err => {
          console.error('Failed to copy paths:', err);
          // Fallback: Use the browser's clipboard API if available
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(paths.join('\n'))
              .then(() => console.log('Copied using browser API'))
              .catch(clipErr => console.error('Browser clipboard failed:', clipErr));
          }
        });
    }
    closeMenu();
  }

  function handlePaste() {
    dispatch('paste');
    closeMenu();
  }

  function handleRename() {
    if (item) {
      const newName = prompt('Enter new name:', item.name);
      if (newName && newName !== item.name) {
        fileSystem.renameItem(item.path, newName);
      }
    }
    closeMenu();
  }

  function handleDelete() {
    if (items.length > 0) {
      const confirmMessage = items.length === 1
        ? `Are you sure you want to delete "${items[0].name}"?`
        : `Are you sure you want to delete ${items.length} items?`;

      if (confirm(confirmMessage)) {
        fileSystem.deleteSelected(true);
      }
    }
    closeMenu();
  }

  function handleNewFolder() {
    const name = prompt('Enter folder name:', 'New Folder');
    if (name) {
      fileSystem.createDirectory(name);
    }
    closeMenu();
  }

  function handleAddToFavorites() {
    if (item && item.file_type === FileType.Directory) {
      fileSystem.addToFavorites(item.path);
    }
    closeMenu();
  }

  function closeMenu() {
    visible = false;
    dispatch('close');
  }

  // Close menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (visible && menu && !menu.contains(event.target as Node)) {
      closeMenu();
    }
  }

  // Update menu dimensions after rendering
  function updateMenuDimensions() {
    if (menu) {
      menuWidth = menu.offsetWidth;
      menuHeight = menu.offsetHeight;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  // Update dimensions when visibility changes
  $: if (visible) {
    setTimeout(updateMenuDimensions, 0);
  }
</script>

{#if visible}
  <div
    class="context-menu"
    bind:this={menu}
    style="left: {adjustedX}px; top: {adjustedY}px;"
  >
    {#if isBackground}
      <!-- Background context menu -->
      <button class="menu-item" on:click={handleNewFolder}>
        <span class="material-symbols-outlined">create_new_folder</span>
        <span>New Folder</span>
      </button>

      <button class="menu-item" on:click={handlePaste}>
        <span class="material-symbols-outlined">content_paste</span>
        <span>Paste</span>
      </button>

      <div class="menu-divider"></div>

      <button class="menu-item" on:click={() => fileSystem.refreshCurrentDirectory()}>
        <span class="material-symbols-outlined">refresh</span>
        <span>Refresh</span>
      </button>
    {:else}
      <!-- Item context menu -->
      {#if item && item.file_type === FileType.File}
        <button class="menu-item" on:click={handleOpen}>
          <span class="material-symbols-outlined">open_in_new</span>
          <span>Open</span>
        </button>
      {/if}

      <button class="menu-item" on:click={handleCut}>
        <span class="material-symbols-outlined">content_cut</span>
        <span>Cut</span>
      </button>

      <button class="menu-item" on:click={handleCopy}>
        <span class="material-symbols-outlined">content_copy</span>
        <span>Copy</span>
      </button>

      <button class="menu-item" on:click={handleCopyPath}>
        <span class="material-symbols-outlined">link</span>
        <span>Copy Path</span>
      </button>

      {#if items.length === 1}
        <button class="menu-item" on:click={handleRename}>
          <span class="material-symbols-outlined">drive_file_rename</span>
          <span>Rename</span>
        </button>
      {/if}

      <button class="menu-item delete" on:click={handleDelete}>
        <span class="material-symbols-outlined">delete</span>
        <span>Delete</span>
      </button>

      {#if item && item.file_type === FileType.Directory}
        <div class="menu-divider"></div>

        <button class="menu-item" on:click={handleAddToFavorites}>
          <span class="material-symbols-outlined">star</span>
          <span>Add to Favorites</span>
        </button>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .context-menu {
    position: fixed;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    z-index: 1000;
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
  }

  .menu-item:hover {
    background-color: #f5f5f5;
  }

  .menu-item .material-symbols-outlined {
    margin-right: 8px;
  }

  .menu-item.delete {
    color: #f44336;
  }

  .menu-divider {
    height: 1px;
    background-color: #ddd;
    margin: 4px 0;
  }

  /* Notification */
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #4caf50;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 2000;
    animation: fadeInOut 2s ease-in-out;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .context-menu {
      background-color: #333;
      border: 1px solid #444;
      color: #eee;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .menu-item:hover {
      background-color: #444;
    }

    .menu-divider {
      background-color: #444;
    }

    .notification {
      background-color: #388e3c;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    }
  }
</style>
