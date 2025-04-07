import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { items, type NewItemSchema } from "$lib/schema";
import type { RequestHandler } from "@sveltejs/kit";
import "@std/dotenv/load";
import { env } from "$env/dynamic/private";

const db = drizzle({
	connection: {
		url: env.TURSO_DATABASE_URL!,
		authToken: env.TURSO_AUTH_TOKEN!,
	},
});

export const POST: RequestHandler = async ({ request }) => {
	const data: NewItemSchema = await request.json();

	// Debug image data if present
	if (data.type === "note" && data.imageData) {
		console.log("Received note with image data type:", typeof data.imageData);
		console.log("Image data length:", data.imageData.length);
	}

	// Assuming data matches NewItemSchema shape
	const inserted = await db.insert(items).values(data).returning();
	return Response.json(inserted[0]);
};

export const GET: RequestHandler = async () => {
	const allItems = await db.select().from(items);

	const processedItems = allItems.map((item: any) => {
		console.log({ item });

		return {
			...item,
			imageData: item.imageData,
		};
	});

	return Response.json(processedItems);
};

export const DELETE: RequestHandler = async ({ url }) => {
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

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { id, ...fieldsToUpdate } = data;

		if (!id) {
			return new Response("Missing id in request body", { status: 400 });
		}

		if (Object.keys(fieldsToUpdate).length === 0) {
			return new Response("No fields to update", { status: 400 });
		}

		// Debug image data if present
		if (data.type === "note" && "imageData" in fieldsToUpdate) {
			console.log("PATCH: Image data type:", typeof fieldsToUpdate.imageData);
			if (fieldsToUpdate.imageData) {
				console.log(
					"PATCH: Image data length:",
					fieldsToUpdate.imageData.length,
				);
			} else {
				console.log("PATCH: Image data is null or undefined");
			}
		}

		const updated = await db
			.update(items)
			.set(fieldsToUpdate)
			.where(eq(items.id, id))
			.returning();

		if (updated.length === 0) {
			return new Response("Item not found", { status: 404 });
		}

		return Response.json(updated[0]);
	} catch (error) {
		console.error("Error updating item:", error);
		return new Response("Failed to update item", { status: 500 });
	}
};
