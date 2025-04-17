use crate::models::Post;
use crate::utils::current_timestamp;
use rusqlite::{params, Connection, Error as SqliteError, Result as SqliteResult, Transaction};
use std::collections::HashMap;

// Create a new post in the database
#[allow(dead_code)]
pub fn create_post(conn: &mut Connection, post: &Post) -> SqliteResult<usize> {
    // Start a transaction
    let tx = conn.transaction()?;

    // Insert the post
    tx.execute(
        "INSERT INTO posts (title, body, published, category, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            post.title,
            post.body,
            post.published,
            post.category,
            post.created_at,
            post.updated_at
        ],
    )?;

    // Get the last inserted ID
    let post_id = tx.last_insert_rowid() as usize;

    // Insert tags
    insert_tags(&tx, post_id, &post.tags)?;

    // Commit the transaction
    tx.commit()?;

    Ok(post_id)
}

// Get all posts from the database
pub fn get_all_posts(conn: &Connection) -> SqliteResult<Vec<Post>> {
    // Query all posts
    let mut stmt = conn.prepare(
        "SELECT p.id, p.title, p.body, p.published, p.category, p.created_at, p.updated_at
         FROM posts p
         ORDER BY p.created_at DESC",
    )?;

    let post_iter = stmt.query_map([], |row| {
        Ok(Post {
            id: row.get(0)?,
            title: row.get(1)?,
            body: row.get(2)?,
            published: row.get(3)?,
            category: row.get(4)?,
            tags: Vec::new(), // Will be filled later
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;

    let mut posts: Vec<Post> = Vec::new();
    for post_result in post_iter {
        posts.push(post_result?);
    }

    // Get tags for all posts
    let post_tags = get_tags_for_posts(conn, &posts)?;

    // Assign tags to posts
    for post in &mut posts {
        if let Some(tags) = post_tags.get(&post.id) {
            post.tags = tags.clone();
        }
    }

    Ok(posts)
}

// Get published posts from the database
#[allow(dead_code)]
pub fn get_published_posts(conn: &Connection) -> SqliteResult<Vec<Post>> {
    // Query published posts
    let mut stmt = conn.prepare(
        "SELECT p.id, p.title, p.body, p.published, p.category, p.created_at, p.updated_at
         FROM posts p
         WHERE p.published = 1
         ORDER BY p.created_at DESC",
    )?;

    let post_iter = stmt.query_map([], |row| {
        Ok(Post {
            id: row.get(0)?,
            title: row.get(1)?,
            body: row.get(2)?,
            published: row.get(3)?,
            category: row.get(4)?,
            tags: Vec::new(), // Will be filled later
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;

    let mut posts: Vec<Post> = Vec::new();
    for post_result in post_iter {
        posts.push(post_result?);
    }

    // Get tags for all posts
    let post_tags = get_tags_for_posts(conn, &posts)?;

    // Assign tags to posts
    for post in &mut posts {
        if let Some(tags) = post_tags.get(&post.id) {
            post.tags = tags.clone();
        }
    }

    Ok(posts)
}

// Get a post by ID
#[allow(dead_code)]
pub fn get_post_by_id(conn: &Connection, id: usize) -> SqliteResult<Option<Post>> {
    // Query the post
    let mut stmt = conn.prepare(
        "SELECT p.id, p.title, p.body, p.published, p.category, p.created_at, p.updated_at
         FROM posts p
         WHERE p.id = ?1",
    )?;

    let post_result = stmt.query_row(params![id], |row| {
        Ok(Post {
            id: row.get(0)?,
            title: row.get(1)?,
            body: row.get(2)?,
            published: row.get(3)?,
            category: row.get(4)?,
            tags: Vec::new(), // Will be filled later
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    });

    match post_result {
        Ok(mut post) => {
            // Get tags for the post
            post.tags = get_tags_for_post(conn, post.id)?;
            Ok(Some(post))
        }
        Err(SqliteError::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

// Update a post
#[allow(dead_code)]
pub fn update_post(
    conn: &mut Connection,
    id: usize,
    title: Option<String>,
    body: Option<String>,
    published: Option<bool>,
    category: Option<Option<String>>,
    tags: Option<Vec<String>>,
) -> SqliteResult<bool> {
    // Check if the post exists
    let post_exists = match get_post_by_id(conn, id)? {
        Some(_) => true,
        None => return Ok(false),
    };

    // Only proceed if the post exists
    if !post_exists {
        return Ok(false);
    }

    // Start a transaction
    let tx = conn.transaction()?;

    // Build the update query
    let mut query_parts = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(title) = &title {
        query_parts.push("title = ?");
        params.push(Box::new(title.clone()));
    }

    if let Some(body) = &body {
        query_parts.push("body = ?");
        params.push(Box::new(body.clone()));
    }

    if let Some(published) = &published {
        query_parts.push("published = ?");
        params.push(Box::new(*published));
    }

    if let Some(category) = &category {
        query_parts.push("category = ?");
        params.push(Box::new(category.clone()));
    }

    // Always update the updated_at timestamp
    let now = current_timestamp();
    query_parts.push("updated_at = ?");
    params.push(Box::new(now));

    // Execute the update if there are fields to update
    if !query_parts.is_empty() {
        let query = format!("UPDATE posts SET {} WHERE id = ?", query_parts.join(", "));

        let mut stmt = tx.prepare(&query)?;
        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

        // Add the ID parameter to the vector
        let mut all_params = param_refs.clone();
        all_params.push(&id as &dyn rusqlite::ToSql);

        stmt.execute(all_params.as_slice())?;
    }

    // Update tags if provided
    if let Some(new_tags) = tags {
        // Delete existing tags
        tx.execute("DELETE FROM post_tags WHERE post_id = ?1", params![id])?;

        // Insert new tags
        insert_tags(&tx, id, &new_tags)?;
    }

    // Commit the transaction
    tx.commit()?;

    Ok(true)
}

// Delete a post
#[allow(dead_code)]
pub fn delete_post(conn: &mut Connection, id: usize) -> SqliteResult<bool> {
    // Start a transaction
    let tx = conn.transaction()?;

    // Delete post tags (cascade will handle this, but being explicit)
    tx.execute("DELETE FROM post_tags WHERE post_id = ?1", params![id])?;

    // Delete the post
    let rows_affected = tx.execute("DELETE FROM posts WHERE id = ?1", params![id])?;

    // Commit the transaction
    tx.commit()?;

    Ok(rows_affected > 0)
}

// Helper function to insert tags for a post
fn insert_tags(tx: &Transaction, post_id: usize, tags: &[String]) -> SqliteResult<()> {
    for tag in tags {
        // Insert or get the tag ID
        let tag_id = insert_or_get_tag(tx, tag)?;

        // Link the tag to the post
        tx.execute(
            "INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?1, ?2)",
            params![post_id, tag_id],
        )?;
    }

    Ok(())
}

// Helper function to insert a tag or get its ID if it already exists
fn insert_or_get_tag(tx: &Transaction, tag: &str) -> SqliteResult<usize> {
    // Try to get the tag ID
    let tag_id_result = tx.query_row("SELECT id FROM tags WHERE name = ?1", params![tag], |row| {
        row.get(0)
    });

    match tag_id_result {
        Ok(id) => Ok(id),
        Err(SqliteError::QueryReturnedNoRows) => {
            // Tag doesn't exist, insert it
            tx.execute("INSERT INTO tags (name) VALUES (?1)", params![tag])?;

            Ok(tx.last_insert_rowid() as usize)
        }
        Err(e) => Err(e),
    }
}

// Helper function to get tags for a single post
#[allow(dead_code)]
fn get_tags_for_post(conn: &Connection, post_id: usize) -> SqliteResult<Vec<String>> {
    let mut stmt = conn.prepare(
        "SELECT t.name
         FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = ?1
         ORDER BY t.name",
    )?;

    let tag_iter = stmt.query_map(params![post_id], |row| row.get::<_, String>(0))?;

    let mut tags = Vec::new();
    for tag_result in tag_iter {
        tags.push(tag_result?);
    }

    Ok(tags)
}

// Helper function to get tags for multiple posts
fn get_tags_for_posts(
    conn: &Connection,
    posts: &[Post],
) -> SqliteResult<HashMap<usize, Vec<String>>> {
    if posts.is_empty() {
        return Ok(HashMap::new());
    }

    // Create a list of post IDs
    let post_ids: Vec<usize> = posts.iter().map(|p| p.id).collect();

    // Build the query with placeholders for all post IDs
    let placeholders = (0..post_ids.len())
        .map(|i| format!("?{}", i + 1))
        .collect::<Vec<_>>()
        .join(",");

    let query = format!(
        "SELECT pt.post_id, t.name
         FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id IN ({})
         ORDER BY t.name",
        placeholders
    );

    let mut stmt = conn.prepare(&query)?;

    // Convert post_ids to ToSql trait objects
    let params: Vec<&dyn rusqlite::ToSql> = post_ids
        .iter()
        .map(|id| id as &dyn rusqlite::ToSql)
        .collect();

    let rows = stmt.query_map(params.as_slice(), |row| {
        Ok((row.get::<_, usize>(0)?, row.get::<_, String>(1)?))
    })?;

    let mut result: HashMap<usize, Vec<String>> = HashMap::new();
    for row_result in rows {
        let (post_id, tag) = row_result?;
        result.entry(post_id).or_insert_with(Vec::new).push(tag);
    }

    Ok(result)
}

// Migrate in-memory posts to the database
pub fn migrate_posts(conn: &mut Connection, posts: &[Post]) -> SqliteResult<()> {
    let tx = conn.transaction()?;

    for post in posts {
        // Insert the post
        tx.execute(
            "INSERT OR IGNORE INTO posts (id, title, body, published, category, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                post.id,
                post.title,
                post.body,
                post.published,
                post.category,
                post.created_at,
                post.updated_at
            ],
        )?;

        // Insert tags
        insert_tags(&tx, post.id, &post.tags)?;
    }

    tx.commit()?;

    Ok(())
}
