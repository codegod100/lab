<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen } from '@tauri-apps/api/event';

  type DiskUsage = {
    name: string;
    total: number;
    available: number;
    file_system: string;
  };

  type ProcessInfo = {
    name: string;
    pid: number;
    cpu_usage: number;
    memory: number;
  };

  let disks: DiskUsage[] = [];
  let loading = true;
  let error: string | null = null;

  let stats: { cpu_usage: number; total_memory: number; used_memory: number; top_processes: ProcessInfo[]; top_mem_processes: ProcessInfo[] } | null = null;
  let statsError: string | null = null;

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function formatGiB(bytes: number): string {
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GiB';
  }

  function formatMB(kib: number): string {
    return (kib / 1024).toFixed(2) + ' MB';
  }

  function formatProcMem(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    if (mb > 1000) {
      return (mb / 1024).toFixed(2) + ' GB';
    } else {
      return mb.toFixed(2) + ' MB';
    }
  }

  async function fetchStats() {
    try {
      stats = await invoke('get_system_stats');
      statsError = null;
    } catch (e) {
      statsError = 'Failed to fetch system stats.';
    }
  }

  onMount(async () => {
    try {
      disks = await invoke<DiskUsage[]>('get_disks');
    } catch (e) {
      error = 'Failed to fetch disk usage.';
    } finally {
      loading = false;
    }
    const unlisten = await listen('system_stats', (event) => {
      stats = event.payload as typeof stats;
    });
    return () => {
      unlisten();
    };
  });
</script>

<main class="container">
  <h1>💾 Disk Usage Utility</h1>
  <p class="subtitle">See your disk usage at a glance!</p>
  <div class="system-stats">
    {#if stats}
      <div class="stat">
        <span class="stat-label">CPU Usage:</span>
        <span class="stat-value">{stats.cpu_usage.toFixed(1)}%</span>
      </div>
      <div class="process-list">
        <span class="stat-label">Top Processes:</span>
        {#each stats.top_processes.slice(0, 5) as proc, i}
          <div class="process-row">
            <span class="proc-rank">{i+1}.</span>
            <span class="proc-name" title={proc.name}>{proc.name}</span>
            <span class="proc-pid">({proc.pid})</span>
            <div class="proc-bar-wrap">
              <div class="proc-bar" style="width: {proc.cpu_usage}%"></div>
            </div>
            <span class="proc-cpu">{proc.cpu_usage.toFixed(1)}%</span>
          </div>
        {/each}
      </div>
      <div class="process-list">
        <span class="stat-label">Top Memory Hogs:</span>
        {#each stats.top_mem_processes.slice(0, 5) as proc, i}
          <div class="process-row">
            <span class="proc-rank">{i+1}.</span>
            <span class="proc-name" title={proc.name}>{proc.name}</span>
            <span class="proc-pid">({proc.pid})</span>
            <div class="proc-bar-wrap">
              <div class="proc-bar mem" style="width: {Math.min(100, (proc.memory / stats.total_memory) * 100)}%"></div>
            </div>
            <span class="proc-mem">{formatProcMem(proc.memory)}</span>
          </div>
        {/each}
      </div>
      <div class="stat">
        <span class="stat-label">Memory Used:</span>
        <span class="stat-value">{formatGiB(stats.used_memory)} / {formatGiB(stats.total_memory)}
          <span style="font-size:0.85em;color:#888;"> (raw: {stats.used_memory} / {stats.total_memory})</span>
        </span>
      </div>
    {:else if statsError}
      <div class="error">{statsError}</div>
    {:else}
      <div class="loading">Loading system stats...</div>
    {/if}
  </div>
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
.system-stats {
  width: 100%;
  margin-bottom: 2em;
  background: #23272e;
  border-radius: 0.8em;
  padding: 1em 1.5em;
  display: flex;
  flex-direction: column;
  gap: 0.7em;
  box-shadow: 0 1px 6px rgba(36,200,219,0.13);
  align-items: flex-start;
}
.stat {
  display: flex;
  gap: 1em;
  font-size: 1.1em;
  align-items: center;
}
.stat-label {
  color: #1ec8e7;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.stat-value {
  font-family: monospace;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px #000a;
}
.process-list {
  margin-top: 1em;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.process-row {
  display: flex;
  align-items: center;
  gap: 0.6em;
  font-size: 0.97em;
}
.proc-rank {
  color: #1ec8e7;
  font-weight: 700;
}
.proc-name {
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 10em;
}
.proc-pid {
  color: #888;
  font-size: 0.95em;
}
.proc-bar-wrap {
  flex: 2;
  background: #2e3a43;
  border-radius: 6px;
  height: 12px;
  margin: 0 0.5em;
  overflow: hidden;
  min-width: 60px;
  max-width: 160px;
  display: flex;
  align-items: center;
}
.proc-bar {
  height: 100%;
  background: linear-gradient(90deg, #f7b731 0%, #24c8db 100%);
  border-radius: 6px;
  transition: width 0.4s;
}
.proc-bar.mem {
  background: linear-gradient(90deg, #f76e6e 0%, #f7b731 100%);
}
.proc-cpu {
  font-family: monospace;
  color: #fff;
  font-size: 0.97em;
  margin-left: 0.4em;
}
.proc-mem {
  font-family: monospace;
  color: #ffd;
  font-size: 0.97em;
  margin-left: 0.4em;
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
