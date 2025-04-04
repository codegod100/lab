import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Define possible item types based on main.ts Item interface
const itemTypes = ['note', 'todo', 'bookmark', 'event'] as const;

export const items = sqliteTable('items', {
  // Common fields for all item types
  id: text('id').primaryKey(), // Corresponds to crypto.randomUUID()
  type: text('type', { enum: itemTypes }).notNull(), // Discriminator column
  content: text('content').notNull(), // Holds note content, todo description, bookmark URL, event description
  createdAt: integer('created_at', { mode: 'timestamp_ms' }) // Store JS Date.now() timestamp
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`), // Default to current time in ms

  // Fields specific to certain types (nullable)
  completed: integer('completed', { mode: 'boolean' }), // For 'todo' items (SQLite uses 0/1 for boolean)
  start: text('start'), // For 'event' items (stores ISO string or datetime-local value)
  // Add 'end' if you implement event end times:
  // end: text('end'),
});

// Optional: Define TypeScript types corresponding to the schema for inference
export type ItemSchema = typeof items.$inferSelect; // Type for selecting items
export type NewItemSchema = typeof items.$inferInsert; // Type for inserting items
