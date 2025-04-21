<script lang="ts">
  import Calendar from '$lib/components/Calendar.svelte';
  import IcsSourceManager from '$lib/components/IcsSourceManager.svelte';
  import { allEvents, isLoading, calendarActions } from '$lib/stores/calendarState';
</script>

<main>
  <h1>ICS Calendar Sync</h1>

  <div class="header-actions">
    <button
      class="refresh-button"
      on:click={() => calendarActions.refreshAllSources()}
      disabled={$isLoading}
    >
      {$isLoading ? 'Refreshing...' : 'Refresh All Calendars'}
    </button>
  </div>

  <IcsSourceManager />

  {#if $isLoading}
    <div class="loading">Loading calendar data...</div>
  {/if}

  <Calendar events={$allEvents || []} />
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    margin-bottom: 1rem;
    text-align: center;
  }

  .header-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
  }

  .refresh-button {
    padding: 0.5rem 1rem;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .refresh-button:hover {
    background-color: #3367d6;
  }

  .refresh-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .loading {
    text-align: center;
    padding: 1rem;
    margin-bottom: 1rem;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
</style>
