<script lang="ts">
  // Import necessary Svelte features or libraries here
  import { onMount } from "svelte"; // Import onMount if you plan to use it
  import Calendar from "$lib/components/Calendar.svelte"; // Import the new component
    import type { NewItemSchema } from "$lib/schema";

    let contentLabelElement: HTMLLabelElement | null = null;
    let eventDateDiv: HTMLDivElement | null = null;



  // --- State managed directly within the component ---
  let items = $state<NewItemSchema[]>([]); // Define items state here
  let itemType = $state<"note" | "todo" | "bookmark" | "event">("note");
  let itemContent = $state("");
  let eventStartDate = $state("");
  let searchTerm = $state("");
  // --- End of component state ---



  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    // Create the new item object directly
    const newItem: NewItemSchema = {
      id: crypto.randomUUID(),
      // createdAt: Date.now(),
      type: itemType,
      content: itemContent,
      ...(itemType === "event" &&
        eventStartDate && { startDate: eventStartDate }),
    };

    // Add the new item to the local state array
    items.push(newItem); // Directly mutate the component's state array

    console.log("Added item. Current items:", items);

    // Send the new item to the backend API
    const response = await fetch("/api/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });
    if (!response.ok) {
      console.error("Failed to save item to server");
    } else {
      const savedItem = await response.json();
      console.log("Saved item to server:", savedItem);
    }

    // Reset form state
    itemContent = "";
    eventStartDate = "";
    itemType = "note";
  }

  function handleSearch() {
    console.log("Searching for:", searchTerm);
    // Filter logic using derived state:
    // let filteredItems = $derived(items.filter(item => ...));
  }

  // Example derived state for filtering
  let filteredItems = $derived(
    items.filter((item) => {
      if (!searchTerm.trim()) return true; // Show all if search is empty
      const lowerSearch = searchTerm.toLowerCase();
      // Basic search in content - adjust as needed
      return item.content.toLowerCase().includes(lowerSearch);
    }),
  );

  onMount(async () => {
    console.log("Page component mounted (Runes - Local State)");
    try {
      const response = await fetch('/api/db');
      if (!response.ok) {
        console.error('Failed to fetch items from server');
        return;
      }
      const data = await response.json();
      items = data;
      console.log('Loaded items from server:', items);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  });
    async function deleteItem(id: string) {
      try {
        const response = await fetch(`/api/db?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          console.error('Failed to delete item');
          return;
        }
        // Remove item from local state
        items = items.filter(item => item.id !== id);
        console.log('Deleted item with id:', id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }

  // Optional: Persist items to local storage whenever they change
  $effect(() => {
    // This code runs after items array has been updated
    // console.log('Items changed, saving to localStorage:', items);
    // try {
    //   localStorage.setItem('myItems', JSON.stringify(items));
    // } catch (e) {
    //   console.error("Failed to save items to localStorage", e);
    // }
  });
</script>

<!-- Apply Tailwind classes for layout and spacing -->
<div id="app" class="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
  <h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-6">
    My Items & Events
  </h1>

  <!-- Form section with Tailwind styling -->
  <form
    id="add-item-form"
    class="bg-white p-6 rounded-md shadow-sm mb-8"
    onsubmit={handleSubmit}
  >
    <h2 class="text-xl font-semibold mb-4">Add New Item</h2>
    <div class="mb-4">
      <label
        for="item-type"
        class="block text-sm font-medium text-gray-700 mb-1">Type:</label
      >
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
      <label
        for="item-content"
        bind:this={contentLabelElement}
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        {itemType === "bookmark" ? "URL:" : "Content:"}
      </label>
      <textarea
        id="item-content"
        name="content"
        rows="4"
        required
        placeholder={itemType === "bookmark"
          ? "https://example.com"
          : "Enter details..."}
        bind:value={itemContent}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm min-h-[80px]"
      ></textarea>
    </div>
    <!-- Conditionally render event date inputs using Svelte's #if block -->
    {#if itemType === "event"}
      <div class="mb-4 event-date-inputs" bind:this={eventDateDiv}>
        <label
          for="event-start-date"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Start Date & Time:</label
        >
        <input
          type="datetime-local"
          id="event-start-date"
          name="start"
          bind:value={eventStartDate}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    {/if}
    <button
      type="submit"
      class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Add Item
    </button>
  </form>

  <!-- Use the new Calendar component -->
  <Calendar />

  <!-- Search Section -->
  <section id="search-section" class="mt-10 pt-6 border-t border-gray-200">
    <h2 class="text-xl font-semibold mb-4">Search / Filter</h2>
    <div class="search-container bg-white p-6 rounded-md shadow-sm">
      <label
        for="search-input"
        class="block text-sm font-medium text-gray-700 mb-1">Search:</label
      >
      <input
        type="search"
        id="search-input"
        placeholder="Search items by content..."
        bind:value={searchTerm}
        oninput={handleSearch}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  </section>

  <!-- Items Section - Uses local 'items' state -->
  <section id="items-section" class="mt-10 pt-6 border-t border-gray-200">
    <h2 class="text-xl font-semibold mb-4">Items ({filteredItems.length})</h2>
    <div
      id="items-list"
      class="mt-4 space-y-4 p-4 bg-white rounded-md shadow-sm min-h-[100px]"
    >
      {#each filteredItems as item (item.id)}
        <div class="item p-3 border rounded-md shadow-sm bg-gray-50">
          <strong class="capitalize font-medium text-indigo-700"
            >{item.type}</strong
          >
          {#if item.type === "event" && item.start}
            <span class="text-sm text-gray-600 ml-2"
              >({new Date(item.start).toLocaleString()})</span
            >
          {/if}
          <p class="mt-1 text-gray-800 whitespace-pre-wrap break-words">
            {item.content}
          </p>
          {#if item.type === "bookmark"}
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline text-sm block mt-1"
              >Visit Link</a
            >
          {/if}
          <p class="text-xs text-gray-400 mt-2">
            Added: {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
          </p>
          <button
            onclick={() => deleteItem(item.id)}
            class="mt-2 inline-flex items-center px-2 py-1 border border-red-300 rounded text-red-600 hover:bg-red-50 text-xs"
          >
            Delete
          </button>
        </div>
      {:else}
        <p class="italic text-gray-500">
          {#if items.length === 0}
            <i>No items added yet. Use the form above!</i>
          {:else}
            <i>No items match your search term "{searchTerm}".</i>
          {/if}
        </p>
      {/each}
    </div>
  </section>
</div>
