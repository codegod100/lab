<script lang="ts">
  import { sources, isLoading, error, calendarActions } from '$lib/stores/calendarState';
  import { format } from 'date-fns';

  // State
  let newSourceUrl = '';
  let newSourceName = '';
  let newSourceColor = '#4285f4';
  let isFormVisible = false;

  // Methods
  async function addSource() {
    if (!newSourceUrl || !newSourceName) {
      return;
    }

    await calendarActions.addSource(newSourceUrl, newSourceName, newSourceColor);

    // Reset form
    newSourceUrl = '';
    newSourceName = '';
    newSourceColor = '#4285f4';
    isFormVisible = false;
  }

  function toggleForm() {
    isFormVisible = !isFormVisible;
  }
</script>

<div class="ics-source-manager">
  <div class="source-manager-header">
    <h3>Calendar Sources</h3>
    <button on:click={toggleForm}>
      {isFormVisible ? 'Cancel' : 'Add Source'}
    </button>
  </div>

  {#if $error}
    <div class="error-message">
      {$error}
    </div>
  {/if}

  {#if isFormVisible}
    <div class="add-source-form">
      <div class="form-group">
        <label for="source-name">Calendar Name</label>
        <input
          id="source-name"
          type="text"
          bind:value={newSourceName}
          placeholder="My Calendar"
          required
        />
      </div>

      <div class="form-group">
        <label for="source-url">ICS URL</label>
        <input
          id="source-url"
          type="url"
          bind:value={newSourceUrl}
          placeholder="https://example.com/calendar.ics"
          required
        />
      </div>

      <div class="form-group">
        <label for="source-color">Color</label>
        <input
          id="source-color"
          type="color"
          bind:value={newSourceColor}
        />
      </div>

      <div class="form-actions">
        <button
          on:click={addSource}
          disabled={$isLoading || !newSourceUrl || !newSourceName}
        >
          {$isLoading ? 'Adding...' : 'Add Calendar'}
        </button>
      </div>
    </div>
  {/if}

  <div class="source-list">
    {#if $sources.length === 0}
      <div class="empty-state">
        No calendars added yet. Add an ICS calendar source to get started.
      </div>
    {:else}
      {#each $sources as source}
        <div class="source-item">
          <div class="source-color" style="background-color: {source.color || '#4285f4'};"></div>
          <div class="source-info">
            <div class="source-name">{source.name}</div>
            <div class="source-details">
              {source.events.length} events
              {#if source.lastUpdated}
                · Updated {format(new Date(source.lastUpdated), 'MMM d, yyyy HH:mm')}
              {/if}
            </div>
          </div>
          <div class="source-actions">
            <button
              class="refresh-button"
              on:click={() => calendarActions.refreshSource(source.id)}
              disabled={$isLoading}
            >
              ↻
            </button>
            <button
              class="remove-button"
              on:click={() => calendarActions.removeSource(source.id)}
              disabled={$isLoading}
            >
              ×
            </button>
          </div>
        </div>
      {/each}

      <div class="source-list-actions">
        <button
          on:click={() => calendarActions.refreshAllSources()}
          disabled={$isLoading}
        >
          Refresh All
        </button>
        <button
          on:click={() => calendarActions.clearAllSources()}
          disabled={$isLoading}
        >
          Clear All
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .ics-source-manager {
    margin-bottom: 2rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
  }

  .source-manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .source-manager-header h3 {
    margin: 0;
  }

  .error-message {
    background-color: #ffebee;
    color: #c62828;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .add-source-form {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
  }

  .form-group input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
  }

  .empty-state {
    padding: 1rem;
    text-align: center;
    color: #757575;
  }

  .source-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .source-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }

  .source-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 0.75rem;
  }

  .source-info {
    flex: 1;
  }

  .source-name {
    font-weight: bold;
  }

  .source-details {
    font-size: 0.8rem;
    color: #757575;
  }

  .source-actions {
    display: flex;
    gap: 0.25rem;
  }

  .refresh-button, .remove-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.25rem;
  }

  .refresh-button:hover {
    color: #4285f4;
  }

  .remove-button:hover {
    color: #c62828;
  }

  .source-list-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #3367d6;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
</style>
