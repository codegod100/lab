import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import '@std/dotenv/load';
import { d as private_env } from './shared-server-BfUoNEXY.js';

const itemTypes = ["note", "todo", "bookmark", "event"];
const items = sqliteTable("items", {
  // Common fields for all item types
  id: text("id").primaryKey(),
  // Corresponds to crypto.randomUUID()
  type: text("type", { enum: itemTypes }).notNull(),
  // Discriminator column
  content: text("content").notNull(),
  // Holds note content, todo description, bookmark URL, event description
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('subsec') * 1000)`),
  // Default to current time in ms
  context: text("context"),
  // Optional context/category for filtering
  // Fields specific to certain types (nullable)
  completed: integer("completed", { mode: "boolean" }),
  // For 'todo' items (SQLite uses 0/1 for boolean)
  start: text("start"),
  // For 'event' items (stores ISO string or datetime-local value)
  // Add 'end' if you implement event end times:
  // end: text('end'),
  url: text("url"),
  // For 'bookmark' items, stores the URL separately
  imageData: text("image_data"),
  // For storing binary image data, primarily for notes
  imageMimeType: text("image_mime_type")
  // For storing the MIME type of the image
});
const db = drizzle({
  connection: {
    url: private_env.TURSO_DATABASE_URL,
    authToken: private_env.TURSO_AUTH_TOKEN
  }
});
const POST = async ({ request }) => {
  const data = await request.json();
  if (data.type === "note" && data.imageData) {
    console.log("Received note with image data type:", typeof data.imageData);
    console.log("Image data length:", data.imageData.length);
  }
  const inserted = await db.insert(items).values(data).returning();
  return Response.json(inserted[0]);
};
const GET = async () => {
  const allItems = await db.select().from(items);
  const processedItems = allItems.map((item) => {
    console.log({ item });
    return {
      ...item,
      imageData: item.imageData
    };
  });
  return Response.json(processedItems);
};
const DELETE = async ({ url }) => {
  try {
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("Missing id parameter", { status: 400 });
    }
    const deleted = await db.delete(items).where(eq(items.id, id)).returning();
    if (deleted.length === 0) {
      return new Response("Item not found", { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return new Response("Failed to delete item", { status: 500 });
  }
};
const PATCH = async ({ request }) => {
  try {
    const data = await request.json();
    const { id, ...fieldsToUpdate } = data;
    if (!id) {
      return new Response("Missing id in request body", { status: 400 });
    }
    if (Object.keys(fieldsToUpdate).length === 0) {
      return new Response("No fields to update", { status: 400 });
    }
    if (data.type === "note" && "imageData" in fieldsToUpdate) {
      console.log("PATCH: Image data type:", typeof fieldsToUpdate.imageData);
      if (fieldsToUpdate.imageData) {
        console.log(
          "PATCH: Image data length:",
          fieldsToUpdate.imageData.length
        );
      } else {
        console.log("PATCH: Image data is null or undefined");
      }
    }
    const updated = await db.update(items).set(fieldsToUpdate).where(eq(items.id, id)).returning();
    if (updated.length === 0) {
      return new Response("Item not found", { status: 404 });
    }
    return Response.json(updated[0]);
  } catch (error) {
    console.error("Error updating item:", error);
    return new Response("Failed to update item", { status: 500 });
  }
};

export { DELETE, GET, PATCH, POST };
//# sourceMappingURL=_server.ts-BeZrG2G0.js.map
