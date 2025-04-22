<script lang="ts">
  import { fileSystem } from '../stores/fs';
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  
  let homePath = '';
  let drives: string[] = [];
  
  onMount(async () => {
    try {
      homePath = await invoke<string>('get_home_dir');
      drives = await invoke<string[]>('get_drives');
    } catch (error) {
      console.error('Failed to load sidebar data:', error);
    }
  });
  
  function navigateTo(path: string) {
    fileSystem.navigateTo(path);
  }
  
  function removeFromFavorites(path: string, event: MouseEvent) {
    event.stopPropagation();
    fileSystem.removeFromFavorites(path);
  }
</script>

<div class="sidebar">
  <section class="section">
    <h3 class="section-title">Places</h3>
    <ul class="section-list">
      {#if homePath}
        <li 
          class="section-item {$fileSystem.currentPath === homePath ? 'active' : ''}"
          on:click={() => navigateTo(homePath)}
        >
          <span class="material-symbols-outlined">home</span>
          <span class="item-name">Home</span>
        </li>
      {/if}
      
      <li 
        class="section-item {$fileSystem.currentPath === '/tmp' ? 'active' : ''}"
        on:click={() => navigateTo('/tmp')}
      >
        <span class="material-symbols-outlined">folder_special</span>
        <span class="item-name">Temp</span>
      </li>
      
      <li 
        class="section-item {$fileSystem.currentPath === '/' ? 'active' : ''}"
        on:click={() => navigateTo('/')}
      >
        <span class="material-symbols-outlined">hard_drive</span>
        <span class="item-name">Root</span>
      </li>
    </ul>
  </section>
  
  {#if drives.length > 0}
    <section class="section">
      <h3 class="section-title">Devices</h3>
      <ul class="section-list">
        {#each drives as drive}
          <li 
            class="section-item {$fileSystem.currentPath === drive ? 'active' : ''}"
            on:click={() => navigateTo(drive)}
          >
            <span class="material-symbols-outlined">hard_drive</span>
            <span class="item-name">{drive}</span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
  
  <section class="section">
    <h3 class="section-title">Favorites</h3>
    {#if $fileSystem.favorites.length === 0}
      <div class="empty-favorites">
        <p>No favorites yet</p>
        <p class="hint">Right-click a folder and select "Add to Favorites"</p>
      </div>
    {:else}
      <ul class="section-list">
        {#each $fileSystem.favorites as favorite}
          <li 
            class="section-item {$fileSystem.currentPath === favorite ? 'active' : ''}"
            on:click={() => navigateTo(favorite)}
          >
            <span class="material-symbols-outlined">folder</span>
            <span class="item-name">{favorite.split('/').pop() || favorite}</span>
            <button 
              class="remove-favorite" 
              on:click={(e) => removeFromFavorites(favorite, e)}
              title="Remove from favorites"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  .sidebar {
    height: 100%;
    width: 100%;
    background-color: #f5f5f5;
    color: #333;
    overflow-y: auto;
    padding: 16px 0;
  }
  
  .section {
    margin-bottom: 24px;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    color: #666;
    padding: 0 16px;
    margin: 0 0 8px 0;
  }
  
  .section-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .section-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    user-select: none;
    position: relative;
  }
  
  .section-item:hover {
    background-color: #e0e0e0;
  }
  
  .section-item.active {
    background-color: #e3f2fd;
  }
  
  .section-item .material-symbols-outlined {
    margin-right: 8px;
  }
  
  .item-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .remove-favorite {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: #666;
  }
  
  .remove-favorite .material-symbols-outlined {
    font-size: 16px;
    margin: 0;
  }
  
  .section-item:hover .remove-favorite {
    display: block;
  }
  
  .empty-favorites {
    padding: 0 16px;
    color: #999;
  }
  
  .empty-favorites p {
    margin: 4px 0;
  }
  
  .hint {
    font-size: 12px;
    font-style: italic;
  }
  
  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .sidebar {
      background-color: #252525;
      color: #eee;
    }
    
    .section-title {
      color: #aaa;
    }
    
    .section-item:hover {
      background-color: #333;
    }
    
    .section-item.active {
      background-color: #0d47a1;
    }
    
    .remove-favorite {
      color: #aaa;
    }
    
    .empty-favorites {
      color: #777;
    }
  }
</style>
