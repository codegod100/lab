<script lang="ts">
  import { format } from 'date-fns';
  import type { CalendarEvent } from '$lib/types/calendar';

  // Props
  let { event, onClose } = $props<{event: CalendarEvent, onClose: () => void}>();

 $effect(()=>{
  console.dir(event)
 })
  // Format dates
  let formattedStart = $derived(format(new Date(event.start), event.allDay ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm'));
  let formattedEnd = $derived(format(new Date(event.end), event.allDay ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm'));

  // Handle overlay click
  function handleOverlayClick(e: MouseEvent) {
    // Only close if clicking the overlay itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // Handle escape key
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<div class="event-details-overlay" role="dialog" aria-modal="true" tabindex="0" on:click={handleOverlayClick} on:keydown={handleKeyDown}>
  <div class="event-details-modal">
    <div class="event-header" style="background-color: {event.color || '#4285f4'};">
      <h3>{event.title}</h3>
      <button class="close-button" on:click={onClose}>×</button>
    </div>

    <div class="event-content">
      <div class="event-time">
        <strong>When:</strong> {formattedStart} to {formattedEnd}
        {#if event.allDay}
          <span class="all-day-badge">All day</span>
        {/if}
      </div>

      {#if event.location}
        <div class="event-location">
          <strong>Where:</strong> {event.location}
        </div>
      {/if}

      {#if event.description}
        <div class="event-description">
          <strong>Description:</strong>
          <p>{event.description}</p>
        </div>
      {/if}

      {#if event.url}
        <div class="event-url">
          <strong>Link:</strong>
          <a href={event.url} target="_blank" rel="noopener noreferrer">{event.url}</a>
        </div>
      {/if}

      {#if event.categories && event.categories.length > 0}
        <div class="event-categories">
          <strong>Categories:</strong>
          <div class="category-tags">
            {#each event.categories as category}
              <span class="category-tag">{category}</span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .event-details-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .event-details-modal {
    background-color: white;
    border-radius: 4px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .event-header {
    padding: 1rem;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .event-header h3 {
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .event-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .all-day-badge {
    background-color: #f1f1f1;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }

  .category-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .category-tag {
    background-color: #f1f1f1;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }
</style>
