import { User, DbConnection } from "./module_bindings";
let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let token = localStorage.getItem("token") as string;
import { Identity } from "@clockworklabs/spacetimedb-sdk";

const users = new Map<string, User>();
let this_user: User;
const speed = 5;
const dotRadius = 10;
let conn = DbConnection.builder()
  .withUri("wss://maincloud.spacetimedb.com")
  .withModuleName("game")
  .withToken(token)
  .onConnect(connectCallback)
  .build();

conn.db.user.onUpdate((ctx, prev, current) => {
  users[current.identity.toHexString()] = current;
  if (prev.position !== current.position) {
    let ident_string = current.identity.toHexString();
    users[ident_string] = current;
    console.log(
      `User ${current.name || ident_string} updated position:`,
      prev.position,
      current.position,
    );
    drawDot(users);
  }
});

function connectCallback(
  conn: DbConnection,
  identity: Identity,
  token: string,
) {
  localStorage.setItem("token", token);
  console.log(
    `Connected to the database! ${identity.toHexString()}, token: ${token}`,
  );
  conn
    .subscriptionBuilder()
    .onApplied((ctx) => {
      this_user = ctx.db.user.identity.find(identity) as User;
      for (const current of ctx.db.user.iter()) {
        users.set(current.identity.toHexString(), current);
      }
      // Load and display existing messages
      for (const message of ctx.db.message.iter()) {
        // displayMessage(message);
      }
      drawDot(users);

      if (!this_user.name) {
        let name = prompt("What name do you want?") as string;
        conn.reducers.setName(name);
      }
    })
    .subscribe(["select * from user", "select * from message"]);
}

function drawDot(users: Map<string, User>) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const [key, user] of users) {
    let x = user.position.x || canvas.width / 2;
    let y = user.position.y || canvas.height / 2;
    let ballColor = user.ballColor;

    // Initial draw
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
  }
}

globalThis.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      console.log("up");
      this_user.position.y = Math.max(dotRadius, this_user.position.y - speed);
      break;
    case "ArrowDown":
      this_user.position.y = Math.min(
        canvas.height - dotRadius,
        this_user.position.y + speed,
      );
      break;
    case "ArrowLeft":
      this_user.position.x = Math.max(dotRadius, this_user.position.x - speed);
      break;
    case "ArrowRight":
      this_user.position.x = Math.min(
        canvas.width - dotRadius,
        this_user.position.x + speed,
      );
      break;
  }
  console.log("setting");
  conn.reducers.setPosition(this_user.position.x, this_user.position.y);
});
