import { Hono } from 'hono'
import { serveStatic } from 'hono/node-server'
// Re-import jsxRenderer and html helper
import { jsxRenderer, html } from 'hono/jsx-renderer'
// Import Vite Dev Server middleware
import { viteDevServer } from '@hono/vite-dev-server'

// Initialize Hono App
const app = new Hono()

// --- Middleware ---

// Apply Vite middleware only in development
if (process.env.NODE_ENV === 'development') {
  app.use(
    '*',
    viteDevServer({
      entry: 'main.ts',
    })
  )
}

// Add jsxRenderer middleware AFTER Vite middleware
app.use('*', jsxRenderer())

// --- Routing ---

// Root route: Render using JSX
app.get('/', (c) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Placeholders for production assets - requires manifest reading logic
  const prodScript = '/assets/main.js';
  const prodStyle = '/assets/style.css';

  return c.render(
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Notes / Todos / Bookmarks / Events</title>
          {/* Conditional rendering for production CSS */}
          {isProduction ? (
            <link rel="stylesheet" href={prodStyle} />
          ) : (
             null
          )}
          {/* Conditional rendering for script */}
          {isProduction ? (
            <script type="module" src={prodScript}></script>
          ) : (
            <script type="module" src="/main.ts"></script>
          )}
        </head>
        <body>
          <div id="app">
            {/* Static content rendered by the server */}
            <h1>My Items & Events</h1>

            <form id="add-item-form">
              <h2>Add New Item</h2>
              <div>
                <label htmlFor="item-type">Type:</label> {/* Use htmlFor in JSX */}
                <select id="item-type" name="type" required>
                  <option value="note">Note</option>
                  <option value="todo">Todo</option>
                  <option value="bookmark">Bookmark</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div>
                <label htmlFor="item-content" id="content-label">Content:</label> {/* Use htmlFor */}
                <textarea id="item-content" name="content" rows={5} required placeholder="Content, Description, or URL..."></textarea>
              </div>
              {/* Use object for style attribute */}
              <div id="event-date-inputs" style={{ display: 'none' }}>
                  <div>
                      <label htmlFor="event-start-date">Start Date & Time:</label> {/* Use htmlFor */}
                      <input type="datetime-local" id="event-start-date" name="start" />
                  </div>
              </div>
              <button type="submit">Add Item</button>
            </form>

            <div id="calendar-container">
                <h2>Calendar</h2>
                <div id='calendar'></div>
            </div>

            <div id="search-container">
                <label htmlFor="search-input">Search:</label> {/* Use htmlFor */}
                <input type="search" id="search-input" placeholder="Search items..." />
            </div>

            <div id="items-list">
              <h2>Items</h2>
              {/* Items will be rendered here by client-side JavaScript (main.ts) */}
            </div>
          </div>
        </body>
      </html>
  );
})

// --- Static File Serving (for Production) ---

if (process.env.NODE_ENV === 'production') {
  // Serve built assets from dist/assets
  app.use('/assets/*', serveStatic({ root: './dist/' }))

  // Serve vite.svg if it's copied to dist during build
  app.use('/vite.svg', serveStatic({ path: './dist/vite.svg' }))

} else {
  // Serve vite.svg directly in development
  app.use('/vite.svg', serveStatic({ path: './vite.svg' }))
}


// --- Export the app ---
export default app

// --- Development Server (Using tsx) ---
console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode.`);
console.log("Run with 'npm run dev:server' for development.");
