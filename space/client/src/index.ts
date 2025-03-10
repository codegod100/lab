import {
  DbConnection,
  EventContext,
  Message,
  User,
  SetName,
} from "./module_bindings";
import { Identity } from "@clockworklabs/spacetimedb-sdk";

function connectCallback(
  conn: DbConnection,
  identity: Identity,
  token: string,
) {
  localStorage.setItem("token", token);
  console.log(
    `Connected to the database! ${identity.toHexString()}, token: ${token}`,
  );
  conn.subscriptionBuilder().subscribe("select * from user");
  // conn.reducers.setName("tiny toons");
  //conn.reducers.getName();
}
let token = localStorage.getItem("token");
let conn = DbConnection.builder()
  .withUri("ws://localhost:3000")
  .withModuleName("game")
  .withToken(token || "")
  .onConnect(connectCallback)
  .build();

// console.log("hello");
conn.db.user.onUpdate((ctx, prev, current) => {
  if (prev.position !== current.position) {
    console.log(
      `User ${current.name} updated position:`,
      prev.position,
      current.position,
    );
  }
});

const canvas = document.getElementById("myCanvas");
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Set up initial position at center of canvas
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    const dotRadius = 10;
    const speed = 5;

    // Draw the initial dot
    function drawDot() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = "blue";
      ctx.fill();
      ctx.closePath();
    }

    // Initial draw
    drawDot();

    // Handle arrow key presses
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          y = Math.max(dotRadius, y - speed);
          break;
        case "ArrowDown":
          y = Math.min(canvas.height - dotRadius, y + speed);
          break;
        case "ArrowLeft":
          x = Math.max(dotRadius, x - speed);
          break;
        case "ArrowRight":
          x = Math.min(canvas.width - dotRadius, x + speed);
          break;
      }
      conn.reducers.setPosition(x, y);
      drawDot();
      e.preventDefault();
    });
  }
}
