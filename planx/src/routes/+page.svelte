<script lang="ts">
  // Import necessary Svelte features or libraries here
  import { onMount } from 'svelte'; // Import onMount if you plan to use it
  // import Calendar from '@fullcalendar/core'; // Example if using FullCalendar

  // Define component state and logic here
  let itemType = 'note';
  let itemContent = '';
  let eventStartDate = '';
  let searchTerm = '';

  // DOM element references - useful if direct manipulation is needed (e.g., by libraries)
  let eventDateDiv: HTMLDivElement | null = null;
  let contentLabelElement: HTMLLabelElement | null = null;
  let calendarElement: HTMLDivElement | null = null;

  function handleTypeChange() {
    // No need for event argument if using bind:value
    // Show/hide event date inputs based on type using Svelte's reactivity
    // Update content label using Svelte's reactivity
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

  onMount(() => {
    // Initialize calendar, load items, etc. when the component mounts
    if (calendarElement) {
        // Initialize FullCalendar or other calendar library here
        // Example:
        // const calendar = new Calendar(calendarElement, { /* options */ });
        // calendar.render();
        console.log('Calendar element mounted:', calendarElement);
    }
    // Load initial items
  });

</script>



<!-- Apply Tailwind classes for layout and spacing -->
<div id="app" class="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
  <h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-6">My Items & Events</h1>

  <!-- Form section with Tailwind styling -->
  <form id="add-item-form" class="bg-white p-6 rounded-md shadow-sm mb-8" on:submit|preventDefault={handleSubmit}>
    <h2 class="text-xl font-semibold mb-4">Add New Item</h2>
    <div class="mb-4"> 
      <label for="item-type" class="block text-sm font-medium text-gray-700 mb-1">Type:</label>
      <select
        id="item-type"
        name="type"
        required
        bind:value={itemType}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="note">Note</option>
        <option value="todo">Todo</option>
        <option value="bookmark">Bookmark</option>
        <option value="event">Event</option>
      </select>
    </div>
    <div class="mb-4">
      <label for="item-content" bind:this={contentLabelElement} class="block text-sm font-medium text-gray-700 mb-1">
        {itemType === 'bookmark' ? 'URL:' : 'Content:'}
      </label>
      <textarea
        id="item-content"
        name="content"
        rows="4"
        required
        placeholder={itemType === 'bookmark' ? 'https://example.com' : 'Enter details...'}
        bind:value={itemContent}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm min-h-[80px]"
      ></textarea>
    </div>
    <!-- Conditionally render event date inputs using Svelte's #if block -->
    {#if itemType === 'event'}
      <div class="mb-4 event-date-inputs" bind:this={eventDateDiv}>
          <label for="event-start-date" class="block text-sm font-medium text-gray-700 mb-1">Start Date & Time:</label>
          <input
            type="datetime-local"
            id="event-start-date"
            name="start"
            bind:value={eventStartDate}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
      </div>
    {/if}
    <button
      type="submit"
      class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Add Item
    </button>
  </form>

  <!-- Calendar Section -->
  <section id="calendar-section" class="mt-10 pt-6 border-t border-gray-200">
      <h2 class="text-xl font-semibold mb-4">Calendar</h2>
      <div
        id='calendar'
        bind:this={calendarElement}
        class="min-h-[450px] border border-gray-300 rounded-md bg-white shadow-inner p-2.5"
      >
          <!-- Calendar will be rendered here by its library -->
      </div>
  </section>

  <!-- Search Section -->
  <section id="search-section" class="mt-10 pt-6 border-t border-gray-200">
      <h2 class="text-xl font-semibold mb-4">Search / Filter</h2>
      <div class="search-container bg-white p-6 rounded-md shadow-sm">
          <label for="search-input" class="block text-sm font-medium text-gray-700 mb-1">Search:</label>
          <input
            type="search"
            id="search-input"
            placeholder="Search items..."
            bind:value={searchTerm}
            on:input={handleSearch}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
      </div>
  </section>

  <!-- Items Section -->
  <section id="items-section" class="mt-10 pt-6 border-t border-gray-200">
    <h2 class="text-xl font-semibold mb-4">Items</h2>
    <div id="items-list" class="mt-4 p-4 bg-white rounded-md shadow-sm min-h-[100px]">
        <!-- Items will be rendered here, likely using an #each block -->
        <p class="italic text-gray-500"><i>Items will appear here...</i></p>
        <!-- Example:
        {#each filteredItems as item (item.id)}
          <div class="item p-2 border-b">{item.content}</div>
        {/each}
        -->
    </div>
  </section>
</div>
