<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';

  type DiskUsage = {
    name: string;
    total: number;
    available: number;
    file_system: string;
  };

  let disks: DiskUsage[] = [];
  let loading = true;
  let error: string | null = null;

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onMount(async () => {
    try {
      disks = await invoke<DiskUsage[]>('get_disks');
    } catch (e) {
      error = 'Failed to fetch disk usage.';
    } finally {
      loading = false;
    }
  });
</script>

<main class="container">
  <h1>💾 Disk Usage Utility</h1>
  <p class="subtitle">See your disk usage at a glance!</p>
  {#if loading}
    <div class="loading">Loading disks...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <div class="disk-list">
      {#each disks as disk}
        <div class="disk-card">
          <div class="disk-header">
            <span class="disk-icon">🗄️</span>
            <span class="disk-name">{disk.name}</span>
            <span class="disk-fs">({disk.file_system})</span>
          </div>
          <div class="disk-bar">
            <div
              class="disk-bar-used"
              style="width: {((disk.total - disk.available) / disk.total) * 100}%"
            ></div>
          </div>
          <div class="disk-info">
            <span>Used: <b>{formatBytes(disk.total - disk.available)}</b></span>
            <span>Free: <b>{formatBytes(disk.available)}</b></span>
            <span>Total: <b>{formatBytes(disk.total)}</b></span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>

<style>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding-top: 6vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 0.2em;
  text-align: center;
}
.subtitle {
  color: #888;
  margin-bottom: 2em;
  text-align: center;
}
.loading, .error {
  font-size: 1.2em;
  margin-top: 2em;
  color: #888;
}
.error { color: #e35d6a; }
.disk-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}
.disk-card {
  background: #fff;
  border-radius: 1em;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 1.2em 1.5em;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  transition: box-shadow 0.2s;
  border: 2px solid #f3f3f3;
}
.disk-card:hover {
  box-shadow: 0 4px 18px rgba(36,200,219,0.11);
  border-color: #b2f3f9;
}
.disk-header {
  display: flex;
  align-items: center;
  gap: 0.6em;
}
.disk-icon {
  font-size: 1.6em;
}
.disk-name {
  font-weight: 600;
  font-size: 1.1em;
}
.disk-fs {
  color: #bbb;
  font-size: 0.95em;
}
.disk-bar {
  width: 100%;
  height: 18px;
  background: #e8f6f8;
  border-radius: 8px;
  overflow: hidden;
  margin: 0.2em 0 0.1em 0;
  box-shadow: 0 1px 2px rgba(36,200,219,0.07);
}
.disk-bar-used {
  height: 100%;
  background: linear-gradient(90deg, #24c8db 60%, #3e9fff 100%);
  border-radius: 8px 0 0 8px;
  transition: width 0.6s;
}
.disk-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.98em;
  color: #444;
}
@media (max-width: 600px) {
  .container { padding: 2vw; }
  .disk-card { padding: 1em 0.7em; }
  .disk-info { flex-direction: column; gap: 0.2em; }
}
:root {
  background: #f6fafd;
  color: #222;
}
@media (prefers-color-scheme: dark) {
  :root {
    background: #20232a;
    color: #f6fafd;
  }
  .disk-card {
    background: #23272e;
    border-color: #23272e;
  }
  .disk-bar {
    background: #2e3a43;
  }
  .disk-bar-used {
    background: linear-gradient(90deg, #24c8db 60%, #3e9fff 100%);
  }
}
</style>
