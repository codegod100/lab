<script lang="ts">
  // Import necessary Svelte features or libraries here
  import { onMount } from "svelte"; // Import onMount
  import Calendar from "$lib/components/Calendar.svelte"; // Import the new component
  import type { NewItemSchema } from "$lib/schema";

  // --- State managed directly within the component ---
  let editingItemId = $state<string | null>(null);
  let editContent = $state("");
  let editStartDate = $state("");
  let editUrl = $state("");
  let editContext = $state("");

  let items = $state<NewItemSchema[]>([]); // Define items state here
  let itemType = $state<"note" | "todo" | "bookmark" | "event">("note");
  let itemContent = $state("");
  let itemUrl = $state("");
  let eventStartDate = $state("");
  let searchTerm = $state("");
  let itemContext = $state("");
  let searchContext = $state("");
  let availableContexts = $state<string[]>([]);
  let todoContextFilter = $state("");
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
    const updatedFields: Record<string, string | boolean> = { content: editContent, context: editContext };

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

  // Compute available contexts when items change
  $effect(() => {
    console.log("Final availableContexts for dropdown:", availableContexts);
  });
</script>

<!-- Apply DaisyUI classes for layout and spacing -->
<div id="app" class="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
  <h1 class="text-3xl font-bold mb-6">
    My Items & Events
  </h1>

  <!-- Form section with DaisyUI styling -->
  <div class="card bg-base-100 shadow-xl mb-8">
    <div class="card-body">
      <h2 class="card-title">Add New Item</h2>
      <form
        id="add-item-form"
        onsubmit={handleSubmit}
      >
        <div class="form-control w-full mb-4">
          <label for="item-type" class="label">
            <span class="label-text">Type</span>
          </label>
          <select
            id="item-type"
            name="type"
            required
            bind:value={itemType}
            class="select select-bordered w-full"
          >
            <option value="note">Note</option>
            <option value="todo">Todo</option>
            <option value="bookmark">Bookmark</option>
            <option value="event">Event</option>
          </select>
        </div>
        {#if itemType === "bookmark"}
          <div class="form-control w-full mb-4">
            <label for="item-url" class="label">
              <span class="label-text">URL</span>
            </label>
            <input
              id="item-url"
              name="url"
              type="url"
              required
              placeholder="https://example.com"
              bind:value={itemUrl}
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control w-full mb-4">
            <label for="item-content" class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea
              id="item-content"
              name="content"
              rows="4"
              placeholder="Enter bookmark description..."
              bind:value={itemContent}
              class="textarea textarea-bordered w-full min-h-[80px]"
            ></textarea>
          </div>
        {:else}
          <div class="form-control w-full mb-4">
            <label for="item-content" class="label">
              <span class="label-text">Content</span>
            </label>
            <textarea
              id="item-content"
              name="content"
              rows="4"
              required
              placeholder="Enter details..."
              bind:value={itemContent}
              class="textarea textarea-bordered w-full min-h-[80px]"
            ></textarea>
          </div>
        {/if}

        <div class="form-control w-full mb-4">
          <label for="item-context" class="label">
            <span class="label-text">Context (optional)</span>
          </label>
          <input
            id="item-context"
            name="context"
            type="text"
            placeholder="e.g., Work, Personal, Urgent"
            bind:value={itemContext}
            class="input input-bordered w-full"
          />
        </div>
        <!-- Conditionally render event date inputs using Svelte's #if block -->
        {#if itemType === "event"}
          <div class="form-control w-full mb-4">
            <label for="event-start-date" class="label">
              <span class="label-text">Start Date & Time</span>
            </label>
            <input
              type="datetime-local"
              id="event-start-date"
              name="start"
              bind:value={eventStartDate}
              class="input input-bordered w-full"
            />
          </div>
        {/if}
        <div class="card-actions justify-end mt-4">
          <button
            type="submit"
            class="btn btn-primary"
          >
            Add Item
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Calendar and Todo side by side -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <!-- Calendar -->
    <div class="mb-6 md:mb-0">
      <Calendar events={calendarEvents} />
    </div>

    <!-- Todo List -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h2 class="card-title">Todos ({todoItems.length})</h2>
          <div class="flex items-center gap-2">
            <label for="todo-context-filter" class="label-text"
              >Filter by context:</label
            >
            <select
              id="todo-context-filter"
              bind:value={todoContextFilter}
              class="select select-bordered select-sm w-32"
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
              <li class="flex items-start justify-between p-3 border rounded-md bg-base-200">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    checked={todo.completed}
                    onchange={() => toggleComplete(todo.id)}
                  />
                  <span class={todo.completed ? "line-through text-opacity-60" : ""}>
                    {todo.content}
                  </span>
                </label>
                <button
                  onclick={() => {
                    if (confirm("Are you sure you want to delete this item?"))
                      deleteItem(todo.id);
                  }}
                  class="btn btn-error btn-xs"
                >
                  Delete
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="italic text-opacity-60">No todos yet.</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Search Section -->
  <section id="search-section" class="mt-10 pt-6 border-t border-gray-200">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Search / Filter</h2>
        <div class="form-control w-full mb-4">
          <label for="search-input" class="label">
            <span class="label-text">Search</span>
          </label>
          <input
            type="search"
            id="search-input"
            placeholder="Search items by content..."
            bind:value={searchTerm}
            oninput={handleSearch}
            class="input input-bordered w-full"
          />
        </div>

        <div class="form-control w-full">
          <label for="context-select" class="label">
            <span class="label-text">Filter by Context</span>
          </label>
          <select
            id="context-select"
            bind:value={searchContext}
            class="select select-bordered w-full"
          >
            <option value="">All Contexts</option>
            {#each availableContexts as context}
              <option value={context}>{context}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  </section>

  <!-- Items Section - Uses local 'items' state -->
  <section id="items-section" class="mt-10 pt-6 border-t border-gray-200">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Items ({filteredItems.length})</h2>
        <div id="items-list" class="mt-4 space-y-4 min-h-[100px]">
          {#each filteredItems as item (item.id)}
            <div class="card bg-base-200">
              <div class="card-body p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="badge badge-primary capitalize">{item.type}</span>
                    {#if item.type === "event" && item.start}
                      <span class="badge badge-ghost ml-2">
                        {new Date(item.start).toLocaleString()}
                      </span>
                    {/if}
                  </div>
                </div>

                {#if item.type === "todo"}
                  <label class="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      checked={item.completed}
                      onchange={() => toggleComplete(item.id)}
                    />
                    <span class={item.completed ? "line-through opacity-60" : ""}>
                      {item.content}
                    </span>
                  </label>
                {:else}
                  <p class="mt-1 whitespace-pre-wrap break-words">
                    {item.content}
                  </p>
                {/if}

                {#if item.type === "bookmark"}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link link-primary text-sm block mt-1"
                  >
                    {item.url}
                  </a>
                {/if}
                <p class="text-xs opacity-60 mt-2">
                  Added: {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : ""}
                </p>

                {#if editingItemId === item.id}
                  <div class="mt-2 space-y-2">
                    <textarea
                      bind:value={editContent}
                      rows="3"
                      class="textarea textarea-bordered w-full"
                    ></textarea>

                    <input
                      type="text"
                      placeholder="Context (optional)"
                      bind:value={editContext}
                      class="input input-bordered w-full"
                    />

                    {#if item.type === "event"}
                      <input
                        type="datetime-local"
                        bind:value={editStartDate}
                        class="input input-bordered w-full"
                      />
                    {/if}

                    {#if item.type === "bookmark"}
                      <input
                        type="url"
                        placeholder="Bookmark URL"
                        bind:value={editUrl}
                        class="input input-bordered w-full"
                      />
                    {/if}

                    <div class="card-actions justify-end mt-2">
                      <button
                        onclick={() => saveEdit(item.id)}
                        class="btn btn-success btn-sm"
                      >
                        Save
                      </button>
                      <button
                        onclick={cancelEdit}
                        class="btn btn-neutral btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                {:else}
                  <div class="card-actions justify-end mt-2">
                    <button
                      onclick={() => startEdit(item)}
                      class="btn btn-info btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onclick={() => {
                        if (confirm("Are you sure you want to delete this item?"))
                          deleteItem(item.id);
                      }}
                      class="btn btn-error btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          {:else}
            <div class="alert">
              {#if items.length === 0}
                <span>No items added yet. Use the form above!</span>
              {:else}
                <span>No items match your search term "{searchTerm}".</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>
</div>
