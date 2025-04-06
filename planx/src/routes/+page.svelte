<script lang="ts">
  // Import necessary Svelte features or libraries here
  import { onMount } from "svelte"; // Import onMount
  import Calendar from "$lib/components/Calendar.svelte"; // Import the new component
  import type { NewItemSchema } from "$lib/schema";

  let contentLabelElement: HTMLLabelElement | null = null;
  let eventDateDiv: HTMLDivElement | null = null;

  let editingItemId = $state<string | null>(null);
  let editContent = "";
  let editStartDate = "";
  let editUrl = "";

  // --- State managed directly within the component ---
  let items = $state<NewItemSchema[]>([]); // Define items state here
  let itemType = $state<"note" | "todo" | "bookmark" | "event">("note");
  let itemContent = $state("");
  let itemUrl = $state("");
  let eventStartDate = $state("");
  let searchTerm = $state("");
  let itemContext = $state("");
  let searchContext = $state("");
  let editContext = $state("");
  let availableContexts: string[] = $state([]);
  // --- End of component state ---

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    // Create the new item object directly
    const newItem: NewItemSchema = {
      id: crypto.randomUUID(),
      // createdAt: Date.now(),
      type: itemType,
      content: itemContent,
      ...(itemType === "bookmark" && { url: itemUrl }),
      ...(itemType === "todo" && { completed: false }),
      ...(itemType === "event" && eventStartDate && { start: eventStartDate }),
      context: itemContext,
    };

    // Add the new item to the local state array
    items.push(newItem); // Directly mutate the component's state array
    availableContexts = computeAvailableContexts();

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
    itemContext = "";
  }

  function handleSearch() {
    console.log("Searching for:", searchTerm);
    // Filter logic using derived state:
    // let filteredItems = $derived(items.filter(item => ...));
  }

  // Example derived state for filtering
  let filteredItems = $derived(
    items.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.url?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesContext =
        !searchContext.trim() || item.context === searchContext;

      return matchesSearch && matchesContext;
    }),
  );

  let calendarEvents = $derived(
    items
      .filter((item) => item.type === "event" && item.start)
      .map((item) => ({
        id: item.id,
        title: item.content,
        start: item.start as string,
      })),
  );

  let todoContextFilter = $state("");

  let todoItems = $derived(
    items.filter(
      (item) =>
        item.type === "todo" &&
        (todoContextFilter.trim() === "" ||
          (item.context ?? "").toLowerCase() ===
            todoContextFilter.toLowerCase()),
    ),
  );

  onMount(async () => {
    console.log("Page component mounted (Runes - Local State)");
    try {
      const response = await fetch("/api/db");
      if (!response.ok) {
        console.error("Failed to fetch items from server");
        return;
      }
      const data = (await response.json()) as NewItemSchema[];
      items = data;
      availableContexts = computeAvailableContexts();
      console.log("Loaded items from server:", items);
      console.log(
        "Fetched item contexts:",
        data.map((i) => i.context),
      );
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  });
  async function deleteItem(id: string) {
    try {
      const response = await fetch(`/api/db?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Failed to delete item");
        return;
      }
      // Remove item from local state
      items = items.filter((item) => item.id !== id);
      availableContexts = computeAvailableContexts();
      console.log("Deleted item with id:", id);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }

  async function toggleComplete(id: string) {
    const item = items.find((i) => i.id === id);
    if (item && item.type === "todo") {
      const previous = item.completed ?? false;
      item.completed = !previous; // optimistic UI toggle

      try {
        const response = await fetch("/api/db", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            completed: item.completed,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update item on server");
          item.completed = previous; // revert on failure
        }
      } catch (error) {
        console.error("Error updating item:", error);
        item.completed = previous; // revert on error
      }
    }
  }

  async function saveEdit(itemId: string) {
    const updatedFields: any = { content: editContent, context: editContext };

    const item = items.find((i) => i.id === itemId);
    if (item?.type === "bookmark") {
      updatedFields.url = editUrl;
    }
    if (item?.type === "event") {
      updatedFields.start = editStartDate;
    }

    try {
      const response = await fetch("/api/db", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: itemId,
          ...updatedFields,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update item on server");
        return;
      }

      const updatedItem = await response.json();
      // Update local items array
      items = items.map((i) => (i.id === itemId ? updatedItem : i));
      availableContexts = computeAvailableContexts();
      editingItemId = null;
    } catch (error) {
      console.error("Error updating item:", error);
    }
  }

  function startEdit(item: NewItemSchema) {
    editingItemId = item.id;
    editContent = item.content;
    editStartDate = item.start ?? "";
    editContext = item.context ?? "";
    editUrl = item.url ?? "";
  }

  function cancelEdit() {
    editingItemId = null;
  }

  // Optional: Persist items to local storage whenever they change
  function computeAvailableContexts() {
    return Array.from(
      new Set(
        items
          .map((i) => (i.context ?? "").trim().toLowerCase())
          .filter((c) => c !== ""),
      ),
    );
  }

  console.log("Final availableContexts for dropdown:", availableContexts);
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
      {#if itemType === "bookmark"}
        <label
          for="item-url"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          URL:
        </label>
        <input
          id="item-url"
          name="url"
          type="url"
          required
          placeholder="https://example.com"
          bind:value={itemUrl}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />

        <label
          for="item-content"
          class="block text-sm font-medium text-gray-700 mb-1 mt-4"
        >
          Description:
        </label>
        <textarea
          id="item-content"
          name="content"
          rows="4"
          placeholder="Enter bookmark description..."
          bind:value={itemContent}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm min-h-[80px]"
        ></textarea>
      {:else}
        <label
          for="item-content"
          bind:this={contentLabelElement}
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Content:
        </label>
        <textarea
          id="item-content"
          name="content"
          rows="4"
          required
          placeholder="Enter details..."
          bind:value={itemContent}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm min-h-[80px]"
        ></textarea>
      {/if}
    </div>

    <div class="mb-4">
      <label
        for="item-context"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Context (optional):
      </label>
      <input
        id="item-context"
        name="context"
        type="text"
        placeholder="e.g., Work, Personal, Urgent"
        bind:value={itemContext}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
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

  <!-- Calendar and Todo side by side -->
  <div class="flex flex-col md:flex-row md:space-x-6 mb-8">
    <!-- Calendar -->
    <div class="flex-1 mb-6 md:mb-0">
      <Calendar events={calendarEvents} />
    </div>

    <!-- Todo List -->
    <div class="flex-1 bg-white p-4 rounded-md shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Todos ({todoItems.length})</h2>
        <div class="flex items-center space-x-2">
          <label for="todo-context-filter" class="text-sm text-gray-700"
            >Filter by context:</label
          >
          <select
            id="todo-context-filter"
            bind:value={todoContextFilter}
            class="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All</option>
            {#each availableContexts as ctx}
              <option value={ctx}>{ctx}</option>
            {/each}
          </select>
        </div>
      </div>
      {#if todoItems.length > 0}
        <ul class="space-y-3">
          {#each todoItems as todo (todo.id)}
            <li
              class="flex items-start justify-between p-3 border rounded-md shadow-sm bg-gray-50"
            >
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onchange={() => toggleComplete(todo.id)}
                />
                <span
                  class={todo.completed ? "line-through text-gray-400" : ""}
                >
                  {todo.content}
                </span>
              </label>
              <button
                onclick={() => {
                  if (confirm("Are you sure you want to delete this item?"))
                    deleteItem(todo.id);
                }}
                class="ml-4 inline-flex items-center px-2 py-1 border border-red-300 rounded text-red-600 hover:bg-red-50 text-xs"
              >
                Delete
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="italic text-gray-500">No todos yet.</p>
      {/if}
    </div>
  </div>

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

      <label
        for="context-select"
        class="block text-sm font-medium text-gray-700 mb-1 mt-4"
        >Filter by Context:</label
      >
      <select
        id="context-select"
        bind:value={searchContext}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">All Contexts</option>
        {#each availableContexts as context}
          <option value={context}>{context}</option>
        {/each}
      </select>
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

          {#if item.type === "todo"}
            <label class="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={item.completed}
                onchange={() => toggleComplete(item.id)}
              />
              <span class={item.completed ? "line-through text-gray-400" : ""}>
                {item.content}
              </span>
            </label>
          {:else}
            <p class="mt-1 text-gray-800 whitespace-pre-wrap break-words">
              {item.content}
            </p>
          {/if}

          {#if item.type === "bookmark"}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline text-sm block mt-1"
            >
              {item.url}
            </a>
          {/if}
          <p class="text-xs text-gray-400 mt-2">
            Added: {item.createdAt
              ? new Date(item.createdAt).toLocaleString()
              : ""}
          </p>
          {#if editingItemId === item.id}
            <div class="mt-2 space-y-2">
              <textarea
                bind:value={editContent}
                rows="3"
                class="w-full rounded border-gray-300"
              ></textarea>

              <input
                type="text"
                placeholder="Context (optional)"
                bind:value={editContext}
                class="w-full rounded border-gray-300"
              />

              {#if item.type === "event"}
                <input
                  type="datetime-local"
                  bind:value={editStartDate}
                  class="w-full rounded border-gray-300"
                />
              {/if}

              {#if item.type === "bookmark"}
                <input
                  type="url"
                  placeholder="Bookmark URL"
                  bind:value={editUrl}
                  class="w-full rounded border-gray-300"
                />
              {/if}

              <div class="flex space-x-2 mt-2">
                <button
                  onclick={() => saveEdit(item.id)}
                  class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                >
                  Save
                </button>
                <button
                  onclick={cancelEdit}
                  class="px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          {:else}
            <button
              onclick={() => startEdit(item)}
              class="mt-2 inline-flex items-center px-2 py-1 border border-blue-300 rounded text-blue-600 hover:bg-blue-50 text-xs mr-2"
            >
              Edit
            </button>
            <button
              onclick={() => {
                if (confirm("Are you sure you want to delete this item?"))
                  deleteItem(item.id);
              }}
              class="mt-2 inline-flex items-center px-2 py-1 border border-red-300 rounded text-red-600 hover:bg-red-50 text-xs"
            >
              Delete
            </button>
          {/if}
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
