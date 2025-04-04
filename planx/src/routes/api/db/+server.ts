import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { items, type NewItemSchema } from '$lib/schema';
import type { RequestHandler } from '@sveltejs/kit';
import "@std/dotenv/load";

const db = drizzle({
    connection: {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!
    }
});


export const POST: RequestHandler = async ({ request }) => {
    const data: NewItemSchema = await request.json();
    console.log({ data })
    // Assuming data matches NewItemSchema shape
    const inserted = await db.insert(items).values(data).returning();
    return Response.json(inserted[0]);
}

export const GET: RequestHandler = async () => {
    const allItems = await db.select().from(items);
    return Response.json(allItems);
};

export const DELETE: RequestHandler = async ({ url }) => {
    try {
        const id = url.searchParams.get('id');
        if (!id) {
            return new Response('Missing id parameter', { status: 400 });
        }
        const deleted = await db.delete(items).where(eq(items.id, id)).returning();
        if (deleted.length === 0) {
            return new Response('Item not found', { status: 404 });
        }
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return new Response('Failed to delete item', { status: 500 });
    }
};