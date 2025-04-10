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
  let editImageData = $state<string | null>(null);
  let editImageMimeType = $state<string | null>(null);
  let editImagePreviewUrl = $state<string | null>(null);

  let items = $state<NewItemSchema[]>([]); // Define items state here
  let itemType = $state<"note" | "todo" | "bookmark" | "event">("note");
  let itemContent = $state("");
  let itemUrl = $state("");
  let eventStartDate = $state("");
  let searchTerm = $state("");
  let itemContext = $state("");
  let searchContext = $state("");
  let searchItemType = $state<"" | "note" | "todo" | "bookmark" | "event">("");
  let sortNewestFirst = $state<boolean>(true); // For filtering by item type
  let availableContexts = $state<string[]>([]);
  let todoContextFilter = $state("");
  let itemImageData = $state<string | null>(null); // For storing base64 encoded image data
  let itemImageMimeType = $state<string | null>(null); // For storing image MIME type
  let imagePreviewUrl = $state<string | null>(null); // For displaying image preview
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
      ...(itemType === "note" && itemImageData && {
        imageData: itemImageData,
        imageMimeType: itemImageMimeType
      }),
      context: itemContext,
    };

    // Debug image data
    if (itemType === "note" && itemImageData) {
      console.log('Submitting note with image data:', typeof itemImageData);
    }

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
    itemImageData = null;
    itemImageMimeType = null;
    imagePreviewUrl = null;
  }

  function handleSearch() {
    console.log("Searching for:", searchTerm);
    // Filter logic using derived state:
    // let filteredItems = $derived(items.filter(item => ...));
  }

  function clearSearch() {
    searchTerm = "";
    searchContext = "";
    searchItemType = "";
    console.log("Search cleared");
  }

  // Memoize filtered items to improve performance
  function getFilteredItems() {
    // First filter the items
    const filtered = items.filter((item) => {
      // Skip image data comparison for performance
      const matchesSearch =
        !searchTerm.trim() ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.url?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesContext =
        !searchContext.trim() || item.context === searchContext;

      const matchesItemType =
        !searchItemType.trim() || item.type === searchItemType;

      return matchesSearch && matchesContext && matchesItemType;
    });

    // Then sort the filtered items
    return filtered.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortNewestFirst ? bTime - aTime : aTime - bTime;
    });
  }

  // Use derived state but with optimized filtering
  let filteredItems = $derived(getFilteredItems());

  // Optimize calendar events calculation
  function getCalendarEvents() {
    return items
      .filter((item) => item.type === "event" && item.start)
      .map((item) => ({
        id: item.id,
        title: item.content,
        start: item.start as string,
      }));
  }

  let calendarEvents = $derived(getCalendarEvents());

  // Optimize todo items filtering - only return active (non-completed) todos
  function getTodoItems() {
    return items.filter(
      (item) =>
        item.type === "todo" &&
        (item.completed === false || item.completed === null) &&
        (todoContextFilter.trim() === "" ||
          (item.context ?? "").toLowerCase() ===
            todoContextFilter.toLowerCase()),
    );
  }

  // Get completed todo items
  function getCompletedTodoItems() {
    return items.filter(
      (item) =>
        item.type === "todo" &&
        item.completed === true &&
        (todoContextFilter.trim() === "" ||
          (item.context ?? "").toLowerCase() ===
            todoContextFilter.toLowerCase()),
    );
  }

  // Group todos by context when unfiltered
  function getTodosByContext() {
    if (todoContextFilter.trim() !== "") {
      // If filtering by context, don't group
      return null;
    }

    const todosByContext: Record<string, NewItemSchema[]> = {};

    // Add a special "No Context" group
    todosByContext["No Context"] = [];

    // Get all todos (both active and completed)
    const allTodos = items.filter(
      (item) =>
        item.type === "todo" &&
        (todoContextFilter.trim() === "" ||
          (item.context ?? "").toLowerCase() ===
            todoContextFilter.toLowerCase())
    );

    // Group todos by their context
    for (const todo of allTodos) {
      const context = todo.context?.trim() || "No Context";
      if (!todosByContext[context]) {
        todosByContext[context] = [];
      }
      todosByContext[context].push(todo);
    }

    // Remove empty groups
    for (const context of Object.keys(todosByContext)) {
      if (todosByContext[context].length === 0) {
        delete todosByContext[context];
      }
    }

    return todosByContext;
  }

  let todoItems = $derived(getTodoItems());
  let completedTodoItems = $derived(getCompletedTodoItems());
  let showCompletedTodos = $state(true);

  onMount(async () => {
    console.log("Page component mounted (Runes - Local State)");
    try {
      // Use a timeout to allow the UI to render first
      setTimeout(async () => {
        const response = await fetch("/api/db");
        if (!response.ok) {
          console.error("Failed to fetch items from server");
          return;
        }
        const data = (await response.json()) as NewItemSchema[];
        console.log("data",data)
        // Process items in batches to avoid UI freezing
        const batchSize = 20;
        const processItemBatch = (startIndex: number) => {
          const endIndex = Math.min(startIndex + batchSize, data.length);
          const batch = data.slice(startIndex, endIndex);

          // Update items with the current batch
          items = [...items, ...batch];
          console.log("items",items)
          // If there are more items to process, schedule the next batch
          if (endIndex < data.length) {
            setTimeout(() => processItemBatch(endIndex), 10);
          } else {
            // All items processed, update contexts
            availableContexts = computeAvailableContexts();
            console.log("Loaded all items from server");
          }
        };

        // Start processing items in batches
        items = [];
        processItemBatch(0);
      }, 100);
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
    const updatedFields: Record<string, string | boolean | null> = { content: editContent, context: editContext };

    const item = items.find((i) => i.id === itemId);
    if (item?.type === "bookmark") {
      updatedFields.url = editUrl;
    }
    if (item?.type === "event") {
      updatedFields.start = editStartDate;
    }
    if (item?.type === "note") {
      if (editImageData) {
        updatedFields.imageData = editImageData;
        updatedFields.imageMimeType = editImageMimeType;
        console.log('Updating note with image data:', typeof editImageData);
      } else {
        // If we're editing a note and there's no image data, set it to null explicitly
        updatedFields.imageData = null;
        updatedFields.imageMimeType = null;
      }
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
    // Handle image data if present
    if (typeof item.imageData === 'string') {
      editImageData = item.imageData;
      editImageMimeType = item.imageMimeType || 'image/jpeg'; // Default to JPEG if not specified

      // Create the correct data URL with the proper MIME type
      const mimeType = item.imageMimeType || 'image/jpeg';
      editImagePreviewUrl = `data:${mimeType};base64,${item.imageData}`;
    } else {
      editImageData = null;
      editImageMimeType = null;
      editImagePreviewUrl = null;
    }
  }

  function cancelEdit() {
    editingItemId = null;
  }

  // Handle image paste events for new items
  function handlePaste(event: ClipboardEvent) {
    // Only process paste events when the note type is selected
    if (itemType !== "note") return;

    const items = event.clipboardData?.items;
    if (!items) return;

    // Look for image content in the clipboard
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        // Get the image as a blob
        const blob = items[i].getAsFile();
        if (!blob) continue;

        // Store the MIME type
        const mimeType = items[i].type;
        itemImageMimeType = mimeType;
        console.log('Image MIME type:', mimeType);

        // Resize and compress the image before storing
        resizeAndCompressImage(blob, 800, 0.8).then(resizedBlob => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64String = e.target?.result as string;
            if (base64String) {
              // Store the full base64 string for saving to the database
              itemImageData = base64String;

              // Use the full data URL for the preview
              imagePreviewUrl = base64String;
              console.log('Image data stored:', typeof itemImageData);
            }
          };
          reader.readAsDataURL(resizedBlob);
        });

        // Prevent the default paste behavior
        event.preventDefault();
        break;
      }
    }
  }

  // Function to resize and compress images
  async function resizeAndCompressImage(blob: Blob, maxWidth: number, quality: number): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas element
        const canvas = document.createElement('canvas');

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to blob
          canvas.toBlob(
            (resizedBlob) => {
              if (resizedBlob) {
                resolve(resizedBlob);
              } else {
                // If compression fails, return original blob
                resolve(blob);
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          // If canvas context is not available, return original blob
          resolve(blob);
        }
      };

      // Handle load errors
      img.onerror = () => {
        resolve(blob); // Return original blob on error
      };

      // Load the image from the blob
      img.src = URL.createObjectURL(blob);
    });
  }

  // Handle image paste events for editing
  function handleEditPaste(event: ClipboardEvent) {
    // Only process paste events when editing a note
    const editingItem = items.find((item) => item.id === editingItemId);
    if (!editingItem || editingItem.type !== "note") return;

    const clipboardItems = event.clipboardData?.items;
    if (!clipboardItems) return;

    // Look for image content in the clipboard
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.indexOf('image') !== -1) {
        // Get the image as a blob
        const blob = clipboardItems[i].getAsFile();
        if (!blob) continue;

        // Store the MIME type
        const mimeType = clipboardItems[i].type;
        editImageMimeType = mimeType;
        console.log('Edit image MIME type:', mimeType);

        // Resize and compress the image before storing
        resizeAndCompressImage(blob, 800, 0.8).then(resizedBlob => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64String = e.target?.result as string;
            if (base64String) {
              // Store the full base64 string for saving to the database
              editImageData = base64String;

              // Use the full data URL for the preview
              editImagePreviewUrl = base64String;
              console.log('Edit image data stored:', typeof editImageData);
            }
          };
          reader.readAsDataURL(resizedBlob);
        });

        // Prevent the default paste behavior
        event.preventDefault();
        break;
      }
    }
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
              placeholder="Enter details... (Paste images with Ctrl+V or Cmd+V)"
              bind:value={itemContent}
              onpaste={handlePaste}
              class="textarea textarea-bordered w-full min-h-[80px]"
            ></textarea>

            {#if itemType === "note" && imagePreviewUrl}
              <div class="mt-2">
                <div class="relative">
                  <img src={imagePreviewUrl} alt="" class="max-w-full h-auto rounded-md mt-2" />
                  <button
                    type="button"
                    class="btn btn-circle btn-error btn-sm absolute top-2 right-2"
                    onclick={() => {
                      itemImageData = null;
                      imagePreviewUrl = null;
                    }}
                  >
                    ✕
                  </button>
                </div>
                <p class="text-sm mt-1">Image will be saved with the note</p>
              </div>
            {/if}
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

  <!-- Todo List -->
  <div class="card bg-base-100 shadow-xl mb-8">
    <div class="card-body">
      <div class="flex items-center justify-between mb-4">
        <h2 class="card-title">Active Todos ({todoItems.length})</h2>
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
        {#if todoContextFilter.trim() === ""}
          <!-- Group todos by context when not filtered -->
          {#each Object.entries(getTodosByContext() || {}) as [context, todos]}
            <div class="mb-4">
              <h3 class="font-bold text-lg mb-2">{context}</h3>
              <ul class="space-y-3">
                {#each todos.filter(todo => !todo.completed) as todo (todo.id)}
                  <li class="flex items-start justify-between p-3 border rounded-md bg-base-200">
                    <div class="flex flex-col">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          class="checkbox checkbox-sm"
                          checked={todo.completed}
                          onchange={() => toggleComplete(todo.id)}
                        />
                        <span>
                          {todo.content}
                        </span>
                      </label>
                    </div>
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
            </div>
          {/each}
        {:else}
          <!-- Show flat list when filtered by context -->
          <ul class="space-y-3">
            {#each todoItems as todo (todo.id)}
              <li class="flex items-start justify-between p-3 border rounded-md bg-base-200">
                <div class="flex flex-col">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      checked={todo.completed}
                      onchange={() => toggleComplete(todo.id)}
                    />
                    <span>
                      {todo.content}
                    </span>
                  </label>
                </div>
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
        {/if}
      {:else}
        <p class="italic text-opacity-60">No active todos.</p>
      {/if}

      <!-- Completed Todos Section -->
      <div class="mt-8 border-t pt-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="card-title text-lg">Completed Todos ({completedTodoItems.length})</h2>
          <button
            class="btn btn-sm btn-outline"
            onclick={() => showCompletedTodos = !showCompletedTodos}
          >
            {showCompletedTodos ? 'Hide' : 'Show'}
          </button>
        </div>

        {#if showCompletedTodos && completedTodoItems.length > 0}
          <ul class="space-y-3">
            {#each completedTodoItems as todo (todo.id)}
              <li class="flex items-start justify-between p-3 border rounded-md bg-base-200 opacity-70">
                <div class="flex flex-col">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      checked={todo.completed}
                      onchange={() => toggleComplete(todo.id)}
                    />
                    <span class="line-through">
                      {todo.content}
                    </span>
                  </label>
                </div>
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
        {:else if completedTodoItems.length === 0}
          <p class="italic text-opacity-60">No completed todos.</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Calendar -->
  <div class="card bg-base-100 shadow-xl mb-8">
    <div class="card-body p-2">
      <Calendar events={calendarEvents} />
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
          <div class="flex gap-2">
            <input
              type="search"
              id="search-input"
              placeholder="Search items by content..."
              bind:value={searchTerm}
              oninput={handleSearch}
              class="input input-bordered w-full"
            />
            <button
              class="btn btn-outline"
              onclick={clearSearch}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="form-control w-full mb-4">
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

        <div class="form-control w-full">
          <label for="item-type-select" class="label">
            <span class="label-text">Filter by Item Type</span>
          </label>
          <select
            id="item-type-select"
            bind:value={searchItemType}
            class="select select-bordered w-full"
          >
            <option value="">All Types</option>
            <option value="note">Note</option>
            <option value="todo">Todo</option>
            <option value="bookmark">Bookmark</option>
            <option value="event">Event</option>
          </select>
        </div>
      </div>
    </div>
  </section>

  <!-- Items Section - Uses local 'items' state -->
  <section id="items-section" class="mt-10 pt-6 border-t border-gray-200">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-2">
          <h2 class="card-title">Items ({filteredItems.length})</h2>
          <button
            class="btn btn-sm btn-outline"
            onclick={() => sortNewestFirst = !sortNewestFirst}
            type="button"
          >
            Sort: {sortNewestFirst ? "Newest First" : "Oldest First"}
          </button>
        </div>
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
                    {#if item.context}
                      <span class="badge badge-secondary ml-2">
                        {item.context}
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
                  {#if item.type === "note" && item.imageData}
                    <div class="mt-2">
                      <img
                        src={typeof item.imageData === 'string' ? item.imageData : ''}
                        alt=""
                        class="max-w-full h-auto rounded-md mt-2"
                        title={item.imageMimeType || 'Image'}
                      />
                    </div>
                  {/if}
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
                      onpaste={handleEditPaste}
                      placeholder="Enter details... (Paste images with Ctrl+V or Cmd+V)"
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

                    {#if item.type === "note" && editImagePreviewUrl}
                      <div class="mt-2">
                        <div class="relative">
                          <img
                            src={typeof editImagePreviewUrl === 'string' ? editImagePreviewUrl : ''}
                            alt=""
                            class="max-w-full h-auto rounded-md mt-2"
                          />
                          <button
                            type="button"
                            class="btn btn-circle btn-error btn-sm absolute top-2 right-2"
                            onclick={() => {
                              editImageData = null;
                              editImagePreviewUrl = null;
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        <p class="text-sm mt-1">Image will be saved with the note</p>
                      </div>
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
