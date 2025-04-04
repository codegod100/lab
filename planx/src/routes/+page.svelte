<script lang="ts">
  // Import necessary Svelte features or libraries here
  // e.g., import { onMount } from 'svelte';
  // import Calendar from '@fullcalendar/core'; // Example if using FullCalendar

  // Define component state and logic here
  let itemType = 'note';
  let itemContent = '';
  let eventStartDate = '';
  let searchTerm = '';

  function handleTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    itemType = target.value;
    // Show/hide event date inputs based on type
    const eventDateDiv = document.getElementById('event-date-inputs');
    if (eventDateDiv) {
        eventDateDiv.style.display = itemType === 'event' ? 'block' : 'none';
    }
    // Update content label
    const contentLabel = document.getElementById('content-label');
    if (contentLabel) {
        contentLabel.textContent = itemType === 'bookmark' ? 'URL:' : 'Content:';
    }
  }

  function handleSubmit() {
    console.log('Submitting:', {
      type: itemType,
      content: itemContent,
      start: itemType === 'event' ? eventStartDate : undefined,
    });
    // Add logic to actually save the item (e.g., API call)
    // Clear form after submission
    itemContent = '';
    eventStartDate = '';
    // Potentially reset itemType or keep it for convenience
  }

  function handleSearch() {
      console.log('Searching for:', searchTerm);
      // Add logic to filter items based on searchTerm
  }

  // onMount(() => {
  //   // Initialize calendar, load items, etc. when the component mounts
  //   const calendarEl = document.getElementById('calendar');
  //   if (calendarEl) {
  //       // Initialize FullCalendar or other calendar library here
  //   }
  //   // Load initial items
  // });

</script>

<svelte:head>
  <title>Notes / Todos / Bookmarks / Events</title>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="/style.css" rel="stylesheet">
  <!-- SvelteKit handles CSS and JS injection. Add global styles or component-specific styles below -->
  <!-- If using FullCalendar or other libraries needing CSS, import them in <script> or link here -->
</svelte:head>

<div id="app">
  <h1>My Items & Events</h1>

  <!-- Use on:submit for form handling in Svelte -->
  <form id="add-item-form" on:submit|preventDefault={handleSubmit}>
    <h2>Add New Item</h2>
    <div>
      <label for="item-type">Type:</label>
      <!-- Bind select value to itemType variable -->
      <select id="item-type" name="type" required bind:value={itemType} on:change={handleTypeChange}>
        <option value="note">Note</option>
        <option value="todo">Todo</option>
        <option value="bookmark">Bookmark</option>
        <option value="event">Event</option>
      </select>
    </div>
    <div>
      <!-- Dynamic label text -->
      <label for="item-content" id="content-label">{itemType === 'bookmark' ? 'URL:' : 'Content:'}</label>
      <!-- Bind textarea value to itemContent variable -->
      <textarea id="item-content" name="content" rows="5" required placeholder="Content, Description, or URL..." bind:value={itemContent}></textarea>
    </div>
    <!-- Conditionally render event date inputs -->
    {#if itemType === 'event'}
      <div id="event-date-inputs">
          <div>
              <label for="event-start-date">Start Date & Time:</label>
              <!-- Bind input value to eventStartDate variable -->
              <input type="datetime-local" id="event-start-date" name="start" bind:value={eventStartDate}>
          </div>
      </div>
    {/if}
    <button type="submit">Add Item</button>
  </form>

  <div id="calendar-container">
      <h2>Calendar</h2>
      <!-- Calendar library will typically mount here -->
      <div id='calendar'></div>
  </div>

  <div id="search-container">
      <label for="search-input">Search:</label>
      <!-- Bind input value to searchTerm and trigger search on input -->
      <input type="search" id="search-input" placeholder="Search items..." bind:value={searchTerm} on:input={handleSearch}>
  </div>

  <div id="items-list">
    <h2>Items</h2>
    <!-- Items will be rendered here, likely using an #each block -->
    <!-- Example:
    {#each items as item (item.id)}
      <div>{item.content}</div>
    {/each}
    -->
  </div>
</div>

<style>
  /* Add component-specific or global styles here */
  #app {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: sans-serif;
  }

  form div {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
  }

  input[type="text"],
  input[type="search"],
  input[type="datetime-local"],
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
  }

  textarea {
      resize: vertical;
  }

  button {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  #calendar-container,
  #search-container,
  #items-list {
      margin-top: 2rem;
  }

  /* Basic styling for the calendar placeholder */
  #calendar {
      min-height: 400px; /* Give it some height */
      border: 1px solid #eee;
      background-color: #f9f9f9;
  }

  /* Hide event date inputs initially - Svelte handles this dynamically now */
  /* #event-date-inputs { display: none; } */

</style>
