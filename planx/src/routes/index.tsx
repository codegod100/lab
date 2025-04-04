import { html } from 'hono/html' // Helper for raw HTML like doctype
// Import the Script component from the renderer
import { jsxRenderer, Script } from 'hono/jsx-renderer'

// Define the Layout component
export const Layout = (props: { title?: string, children?: any }) => html`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" /> {/* Assuming vite.svg is served */}
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${props.title || 'Notes / Todos / Bookmarks / Events'}</title>
    {/*
      Vite middleware will inject necessary CSS links here in dev mode.
      In production, you'll need to handle injecting built CSS links.
      The jsxRenderer might provide helpers for this via manifest.json.
      Let's use the Script helper which often handles both CSS/JS injection.
    */}
    <Script /> {/* Placeholder for Vite injected scripts/styles */}
    {/* We need to ensure main.ts is served and loaded */}
    {/* <script type="module" src="/main.ts"></script> */}
  </head>
  <body>
    <div id="app">
      {/* Content will be populated by client-side main.ts */}
      <h1>My Items & Events</h1>

      <form id="add-item-form">
        <h2>Add New Item</h2>
        <div>
          <label for="item-type">Type:</label>
          <select id="item-type" name="type" required>
            <option value="note">Note</option>
            <option value="todo">Todo</option>
            <option value="bookmark">Bookmark</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div>
          <label for="item-content" id="content-label">Content:</label>
          <textarea id="item-content" name="content" rows="5" required placeholder="Content, Description, or URL..."></textarea>
        </div>
        <div id="event-date-inputs" style="display: none;">
            <div>
                <label for="event-start-date">Start Date & Time:</label>
                <input type="datetime-local" id="event-start-date" name="start">
            </div>
        </div>
        <button type="submit">Add Item</button>
      </form>

      <div id="calendar-container">
          <h2>Calendar</h2>
          <div id='calendar'></div>
      </div>

      <div id="search-container">
          <label for="search-input">Search:</label>
          <input type="search" id="search-input" placeholder="Search items...">
      </div>

      <div id="items-list">
        <h2>Items</h2>
        {/* Items will be rendered here by client-side JavaScript */}
      </div>
    </div>
  </body>
</html>
` 