use spacetimedb::{
    rand::{self, Rng},
    reducer, table, Identity, ReducerContext, SpacetimeType, Table, Timestamp,
};

#[derive(SpacetimeType)]
pub struct Position {
    x: f64,
    y: f64,
}

#[table(name = user, public)]
pub struct User {
    #[primary_key]
    identity: Identity,
    name: Option<String>,
    online: bool,
    position: Position,
    ball_color: String,
}

#[table(name = message, public)]
pub struct Message {
    sender: Identity,
    sent: Timestamp,
    text: String,
}

#[reducer]
/// Clients invoke this reducer to set their user names.
pub fn set_name(ctx: &ReducerContext, name: String) -> Result<(), String> {
    let name = validate_name(name)?;
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.user().identity().update(User {
            name: Some(name),
            ..user
        });
        Ok(())
    } else {
        Err("Cannot set name for unknown user".to_string())
    }
}

#[reducer]
/// Set position of a user.
pub fn set_position(ctx: &ReducerContext, x: f64, y: f64) -> Result<(), String> {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        let position = Position { x, y };
        ctx.db.user().identity().update(User { position, ..user });
        Ok(())
    } else {
        Err("Cannot set position for unknown user".to_string())
    }
}

#[reducer]
/// Set ball color of a user.
pub fn set_ball_color(ctx: &ReducerContext, color: String) -> Result<(), String> {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        let ball_color = color;
        ctx.db.user().identity().update(User { ball_color, ..user });
        Ok(())
    } else {
        Err("Cannot set ball color for unknown user".to_string())
    }
}

/// Takes a name and checks if it's acceptable as a user's name.
fn validate_name(name: String) -> Result<String, String> {
    if name.is_empty() {
        Err("Names must not be empty".to_string())
    } else {
        Ok(name)
    }
}

#[reducer]
/// Clients invoke this reducer to send messages.
pub fn send_message(ctx: &ReducerContext, text: String) -> Result<(), String> {
    let text = validate_message(text)?;
    log::info!("{}", text);
    ctx.db.message().insert(Message {
        sender: ctx.sender,
        text,
        sent: ctx.timestamp,
    });
    Ok(())
}

/// Takes a message's text and checks if it's acceptable to send.
fn validate_message(text: String) -> Result<String, String> {
    if text.is_empty() {
        Err("Messages must not be empty".to_string())
    } else {
        Ok(text)
    }
}

#[reducer(client_connected)]
// Called when a client connects to the SpacetimeDB
pub fn client_connected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        // If this is a returning user, i.e. we already have a `User` with this `Identity`,
        // set `online: true`, but leave `name` and `identity` unchanged.
        ctx.db.user().identity().update(User {
            online: true,
            ..user
        });
    } else {
        // If this is a new user, create a `User` row for the `Identity`,
        // which is online, but hasn't set a name.
        ctx.db.user().insert(User {
            name: None,
            identity: ctx.sender,
            online: true,
            position: Position { x: 0.0, y: 0.0 }, // enter world at origin
            ball_color: generate_random_color(ctx),
        });
    }
    fn generate_random_color(ctx: &ReducerContext) -> String {
        let mut rng = ctx.rng();
        let r = rng.gen_range(0..256);
        let g = rng.gen_range(0..256);
        let b = rng.gen_range(0..256);

        format!("#{:02X}{:02X}{:02X}", r, g, b)
    }
}

#[reducer(client_disconnected)]
// Called when a client disconnects from SpacetimeDB
pub fn identity_disconnected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.user().identity().update(User {
            online: false,
            ..user
        });
    } else {
        // This branch should be unreachable,
        // as it doesn't make sense for a client to disconnect without connecting first.
        log::warn!(
            "Disconnect event for unknown user with identity {:?}",
            ctx.sender
        );
    }
}
