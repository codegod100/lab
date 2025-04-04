// Import your custom styles (after library styles)
import './style.css';

// Import FullCalendar JS
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for potential future interactions
import { drizzle } from 'drizzle-orm/libsql';

// Access variables via import.meta.env and ensure they exist
const dbUrl = import.meta.env.VITE_DATABASE_URL;
const authToken = import.meta.env.VITE_DATABASE_AUTH_TOKEN;

if (!dbUrl || !authToken) {
  throw new Error("Database URL or Auth Token is missing. Make sure VITE_DATABASE_URL and VITE_DATABASE_AUTH_TOKEN are set in your .env file.");
}

// Initialize Drizzle client
const db = drizzle({
  // The drizzle function expects specific arguments.
  // For libsql, it usually takes the client instance directly,
  // or a config object for the client. Let's use the client creation method.
  // You might need to install '@libsql/client' -> npm install @libsql/client
  // import { createClient } from '@libsql/client';
  // const client = createClient({ url: dbUrl, authToken: authToken });
  // db = drizzle(client, { schema }); // If you pass schema here

  // OR if drizzle({ connection: ... }) is the intended way for your version:
   connection: { // This structure might be specific to certain drizzle adapters or versions
     url: dbUrl,
     authToken: authToken
   }
   // If the above `connection` object doesn't work, you likely need to create
   // the libsql client separately and pass it to drizzle:
   // Example:
   // import { createClient } from '@libsql/client';
   // const client = createClient({ url: dbUrl, authToken: authToken });
   // const db = drizzle(client); // Pass the client instance
});

// --- Interfaces ---
interface BaseItem {
  id: string;
  type: 'todo' | 'note' | 'bookmark' | 'event';
  content: string; // Description for events, content for notes/todos, URL for bookmarks
  createdAt: number; // Timestamp
}

interface TodoItem extends BaseItem {
  type: 'todo';
  completed: boolean;
}

interface NoteItem extends BaseItem {
  type: 'note';
}

interface BookmarkItem extends BaseItem {
  type: 'bookmark';
}

interface EventItem extends BaseItem {
  type: 'event';
  start: string; // ISO string or YYYY-MM-DDTHH:mm format from datetime-local
  // end?: string; // Optional end date/time
}

// Union Type for all items
type Item = TodoItem | NoteItem | BookmarkItem | EventItem;


// --- State ---
let items: Item[] = [];
let searchTerm: string = '';
let calendar: Calendar | null = null; // Calendar instance

// --- DOM Elements ---
const app = document.getElementById('app');
const addItemForm = document.getElementById('add-item-form') as HTMLFormElement | null;
const itemTypeSelect = document.getElementById('item-type') as HTMLSelectElement | null;
const itemContentInput = document.getElementById('item-content') as HTMLTextAreaElement | null;
const contentLabel = document.getElementById('content-label') as HTMLLabelElement | null;
const itemsListDiv = document.getElementById('items-list') as HTMLDivElement | null;
const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
// Added Event Date Elements
const eventDateInputsDiv = document.getElementById('event-date-inputs') as HTMLDivElement | null;
const eventStartDateInput = document.getElementById('event-start-date') as HTMLInputElement | null;
// const eventEndDateInput = document.getElementById('event-end-date') as HTMLInputElement | null; // If using end date
const calendarEl = document.getElementById('calendar') as HTMLDivElement | null;


// --- Functions ---

/** Load items from localStorage */
function loadItems(): void {
  const storedItems = localStorage.getItem('app-items');
  if (storedItems) {
    const parsedItems = JSON.parse(storedItems) as any[];
    // Migration: Remove 'title', ensure 'completed' exists for todos
    items = parsedItems.map(item => {
        const { title, ...rest } = item; // Remove title if present
        if (rest.type === 'todo' && typeof rest.completed === 'undefined') {
            rest.completed = false; // Ensure completed field exists
        }
        // Add basic validation for event start date if needed
        if (rest.type === 'event' && !rest.start) {
            console.warn("Loaded event item missing start date:", rest.id);
            // Handle missing start date? Maybe default it or filter out?
            // For now, we'll let it potentially cause issues later if not handled
        }
        return rest;
    }) as Item[];
  } else {
    items = [];
  }
}

/** Save items to localStorage */
function saveItems(): void {
  localStorage.setItem('app-items', JSON.stringify(items));
}

/** Render a single item in the list view */
function renderItem(item: Item): HTMLElement {
  const itemDiv = document.createElement('div');
  itemDiv.classList.add('item', `item-${item.type}`);
  itemDiv.dataset.id = item.id;

  const contentEl = document.createElement('div');
  contentEl.classList.add('item-content');

  const metaEl = document.createElement('p');
  metaEl.classList.add('item-meta');
  // Display start date for events in the list meta
  const dateInfo = item.type === 'event' ? ` | Starts: ${new Date(item.start).toLocaleString()}` : '';
  metaEl.textContent = `Type: ${item.type} | Added: ${new Date(item.createdAt).toLocaleString()}${dateInfo}`;


  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('delete-btn');

  switch (item.type) {
    case 'note':
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = item.content;
      pre.appendChild(code);
      contentEl.appendChild(pre);
      break;
    case 'bookmark':
      // --- Bookmark Preview Card ---
      const previewDiv = document.createElement('div');
      previewDiv.classList.add('bookmark-preview');

      // --- Favicon ---
      const faviconImg = document.createElement('img');
      faviconImg.classList.add('bookmark-favicon');
      faviconImg.alt = 'Favicon';
      const defaultFavicon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmsiPjxwYXRoIGQ9Ik0xMCAxMyBhNSA1IDAgMCAwIDcgN2w0LTRhNSA1IDAgMCAwLTctNyIvPjxwYXRoIGQ9Ik0xNCAxMWExNSA1IDAgMCAwLTcgLTdsLTQgNGE1IDUgMCAwIDAgNyA3Ii8+PC9zdmc+';
      faviconImg.src = defaultFavicon;

      // --- Text Content Area ---
      const textContentDiv = document.createElement('div');
      textContentDiv.classList.add('bookmark-text-content');

      // --- Title Placeholder ---
      const titleEl = document.createElement('div');
      titleEl.classList.add('bookmark-title');
      // We can't reliably fetch the real title due to CORS.
      // Display the hostname as a placeholder title.
      try {
          const url = new URL(item.content);
          titleEl.textContent = url.hostname; // Use hostname as placeholder
      } catch {
          titleEl.textContent = "Bookmark"; // Fallback title
      }

      // --- Description/URL Placeholder ---
      const descriptionEl = document.createElement('div');
      descriptionEl.classList.add('bookmark-description');
      descriptionEl.textContent = item.content; // Display the URL here for now
      // In a real implementation with a proxy, this would show og:description

      // --- Favicon Fetch Attempt ---
      try {
        const url = new URL(item.content);
        const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
        faviconImg.src = faviconUrl;
        faviconImg.onerror = () => { faviconImg.src = defaultFavicon; };
      } catch (e) {
        console.warn(`Could not parse URL for favicon: ${item.content}`, e);
        faviconImg.src = defaultFavicon;
      }

      // --- Assemble Card ---
      textContentDiv.appendChild(titleEl);
      textContentDiv.appendChild(descriptionEl);
      previewDiv.appendChild(faviconImg);
      previewDiv.appendChild(textContentDiv);

      // --- Link Wrapper ---
      const link = document.createElement('a');
      link.href = item.content;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = `Visit ${item.content}`;
      link.appendChild(previewDiv); // Wrap the entire preview card

      contentEl.appendChild(link);
      // --- End Bookmark Preview Card ---
      break;
    case 'todo':
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item.completed;
      checkbox.classList.add('todo-checkbox');
      checkbox.addEventListener('change', () => toggleTodoComplete(item.id));

      const label = document.createElement('label');
      label.appendChild(checkbox);
      label.append(` ${item.content}`); // Description is stored in content
      if (item.completed) {
        itemDiv.classList.add('completed');
      }
      contentEl.appendChild(label);
      break;
    case 'event':
      // Display event description (stored in content)
      const description = document.createElement('p');
      description.textContent = item.content;
      contentEl.appendChild(description);
      // Date is shown in meta
      break;
  }

  itemDiv.appendChild(contentEl);
  itemDiv.appendChild(metaEl);
  itemDiv.appendChild(deleteButton);

  return itemDiv;
}

/** Render all non-event items to the list, applying search filter */
function renderItems(): void {
  if (!itemsListDiv) return;

  itemsListDiv.innerHTML = '<h2>Items</h2>'; // Keep the heading

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  // Filter out events AND apply search term to remaining items
  const filteredListItems = items.filter(item => {
      if (item.type === 'event') return false; // Exclude events from the list view

      // Search in content/URL/description
      const contentMatch = item.content.toLowerCase().includes(lowerCaseSearchTerm);
      // Optionally search in type as well
      const typeMatch = item.type.toLowerCase().includes(lowerCaseSearchTerm);
      return contentMatch || typeMatch;
  });


  if (filteredListItems.length === 0) {
    const noItemsMsg = document.createElement('p');
    noItemsMsg.textContent = searchTerm
        ? 'No non-event items match your search.'
        : 'No notes, todos, or bookmarks yet.';
    itemsListDiv.appendChild(noItemsMsg);
    // Don't return here, we still need to render the calendar
  } else {
      // Sort filtered items by creation date (newest first)
      const sortedItems = [...filteredListItems].sort((a, b) => b.createdAt - a.createdAt);

      sortedItems.forEach(item => {
        const itemElement = renderItem(item);
        itemsListDiv.appendChild(itemElement);
      });
  }

  // Always refresh calendar events when rendering items
  loadEventsIntoCalendar();
}

/** Add a new item (Note, Todo, Bookmark, or Event) */
function addItem(event: Event): void {
  event.preventDefault();

  if (!itemTypeSelect || !itemContentInput) return;

  const type = itemTypeSelect.value as Item['type'];
  const content = itemContentInput.value.trim(); // Description, Note content, Todo text, Bookmark URL
  let start: string | undefined = undefined;

  if (!content) {
    alert('Please fill in the main content/description/URL field.');
    return;
  }

  let newItem: Item;

  if (type === 'event') {
    if (!eventStartDateInput) return;
    start = eventStartDateInput.value;
    if (!start) {
        alert('Please select a start date for the event.');
        return;
    }
    newItem = {
        id: crypto.randomUUID(),
        type: 'event',
        content: content, // Use content as description
        start: start,
        createdAt: Date.now(),
    };
  } else if (type === 'todo') {
    newItem = {
        id: crypto.randomUUID(),
        type: 'todo',
        content: content,
        completed: false,
        createdAt: Date.now(),
    };
  } else { // Note or Bookmark
    newItem = {
        id: crypto.randomUUID(),
        type: type, // Will be 'note' or 'bookmark'
        content: content,
        createdAt: Date.now(),
    };
  }

  items.push(newItem);
  saveItems();
  renderItems(); // Re-renders list and refreshes calendar

  if (addItemForm) addItemForm.reset();
  updateContentLabel(); // Reset label and hide/show date inputs
}

/** Delete an item */
function deleteItem(id: string): void {
  items = items.filter(item => item.id !== id);
  saveItems();
  renderItems(); // Re-renders list and refreshes calendar
}

/** Toggle todo completion status */
function toggleTodoComplete(id: string): void {
    const itemIndex = items.findIndex(item => item.id === id);
    const item = items[itemIndex];

    // Type guard to ensure it's a TodoItem
    if (itemIndex > -1 && item?.type === 'todo') {
        // Create a new object to avoid direct state mutation (good practice)
        const updatedItem: TodoItem = { ...item, completed: !item.completed };
        items[itemIndex] = updatedItem;
        saveItems();
        renderItems(); // Re-render list and calendar
    }
}

/** Update content label and show/hide date inputs based on selected type */
function updateContentLabel(): void {
    if (!contentLabel || !itemTypeSelect || !itemContentInput || !eventDateInputsDiv) return;

    const selectedType = itemTypeSelect.value;

    // Hide event date inputs by default
    eventDateInputsDiv.style.display = 'none';
    itemContentInput.rows = 5; // Default rows
    itemContentInput.placeholder = 'Content, Description, or URL...'; // Reset placeholder

    switch (selectedType) {
        case 'bookmark':
            contentLabel.textContent = 'URL:';
            itemContentInput.rows = 1;
            itemContentInput.placeholder = 'https://example.com';
            break;
        case 'todo':
            contentLabel.textContent = 'Description:';
            itemContentInput.rows = 3;
            itemContentInput.placeholder = 'Describe the task...';
            break;
        case 'note':
            contentLabel.textContent = 'Content:';
            itemContentInput.rows = 5;
            itemContentInput.placeholder = 'Write your note here (code blocks are preserved)...';
            break;
        case 'event':
            contentLabel.textContent = 'Event Description:';
            itemContentInput.rows = 3;
            itemContentInput.placeholder = 'Describe the event...';
            // Show event date inputs
            eventDateInputsDiv.style.display = 'block';
            break;
    }
}

/** Initialize the FullCalendar instance */
function initializeCalendar(): void {
    if (!calendarEl) {
        console.error("Calendar element not found!");
        return;
    }
    // Destroy existing calendar instance if it exists
    if (calendar) {
        calendar.destroy();
    }

    calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth', // Basic month view
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek' // Add week view option
        },
        events: [], // Start with empty events, will be loaded by loadEventsIntoCalendar
        editable: false, // Prevent dragging/resizing for now
        // eventClick: function(info) { // Example: Handle click
        //   alert('Event: ' + info.event.title);
        //   alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
        //   alert('View: ' + info.view.type);
        //   // Potentially open an edit modal or navigate
        // }
    });

    calendar.render();
    loadEventsIntoCalendar(); // Load initial events
}

/** Load/refresh events from the items array into FullCalendar */
function loadEventsIntoCalendar(): void {
    if (!calendar) return;

    const calendarEvents = items
        .filter((item): item is EventItem => item.type === 'event') // Type guard
        .map(eventItem => ({
            id: eventItem.id,
            title: eventItem.content, // Use content as the event title on the calendar
            start: eventItem.start,
            // end: eventItem.end, // Add if using end dates
            // You can add more properties like backgroundColor, textColor etc.
            // extendedProps: { type: 'event' } // Store original type if needed
        }));

    calendar.removeAllEvents(); // Clear existing events
    calendar.addEventSource(calendarEvents); // Add new events
}


// --- Event Listeners ---

// Form submission
addItemForm?.addEventListener('submit', addItem);

// Item list clicks (for delete button on non-event items)
itemsListDiv?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('delete-btn')) {
    const itemDiv = target.closest('.item') as HTMLElement | null;
    if (itemDiv?.dataset.id) {
      // Check if it's not an event before deleting from list view perspective
      // (though deleteItem handles deletion from the main array regardless)
      const item = items.find(i => i.id === itemDiv.dataset.id);
      if (item && item.type !== 'event') {
          deleteItem(itemDiv.dataset.id);
      } else if (item && item.type === 'event') {
          // Optional: Add confirmation specifically for deleting events from the list?
          // Or rely on the calendar view for event management.
          // For now, let's allow deletion from the list meta view too.
           if (confirm(`Delete event "${item.content}"? It will also be removed from the calendar.`)) {
               deleteItem(itemDiv.dataset.id);
           }
      }
    }
  }
});

// Update content label and inputs when type changes
itemTypeSelect?.addEventListener('change', updateContentLabel);

// Search input listener
searchInput?.addEventListener('input', (event) => {
    searchTerm = (event.target as HTMLInputElement).value;
    renderItems(); // Re-render the list based on the new search term (calendar also refreshes)
});


// --- Initial Load ---
if (app && calendarEl) { // Ensure both app and calendar element exist
  loadItems();
  initializeCalendar(); // Initialize calendar AFTER loading items
  renderItems(); // Render list items (which also calls loadEventsIntoCalendar)
  updateContentLabel(); // Set initial form state
} else {
  console.error("App root element or Calendar element not found!");
}
