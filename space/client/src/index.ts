import {
  DbConnection,
  EventContext,
  Message,
  User,
  SetName,
} from "./module_bindings";
import { Identity } from "@clockworklabs/spacetimedb-sdk";
// let ident;
// let x;
// let y;
// let ballColor;

const users = new Map<string, User>();

let this_user: User;

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

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
      for (const current of ctx.db.user.iter()) {
        users[current.identity.toHexString()] = current;
      }
      // Load and display existing messages
      for (const message of ctx.db.message.iter()) {
        displayMessage(message);
      }
      drawDot();
      this_user = ctx.db.user.identity.find(identity) as User;
    })
    .subscribe(["select * from user", "select * from message"]);

  // conn.reducers.setName("tiny toons");
  //conn.reducers.getName();
}
let token = localStorage.getItem("token");
let conn = DbConnection.builder()
  .withUri("wss://maincloud.spacetimedb.com")
  .withModuleName("game")
  .withToken(token || "")
  .onConnect(connectCallback)
  .build();

// console.log("hello");
conn.db.user.onUpdate((ctx, prev, current) => {
  users[current.identity.toHexString()] = current;
  if (prev.position !== current.position) {
    console.log(
      `User ${current.identity.toHexString()} updated position:`,
      prev.position,
      current.position,
    );
    drawDot();
  }
});

// Add event listener for the chat input
document.addEventListener("DOMContentLoaded", () => {
  const chatInput = document.getElementById("chatInput") as HTMLInputElement;
  const sendButton = document.getElementById("sendButton") as HTMLButtonElement;

  // Send message when the Send button is clicked
  sendButton.addEventListener("click", () => {
    sendMessage(chatInput.value);
  });

  // Send message when Enter key is pressed in the input field
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage(chatInput.value);
    }
  });
});

// Add a function to handle sending messages
function sendMessage(message: string) {
  if (message.trim() === "") return;

  // Call the reducer to send the message
  conn.reducers.sendMessage(message);

  // Clear the input field
  const chatInput = document.getElementById("chatInput") as HTMLInputElement;
  chatInput.value = "";
}

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const speed = 5;
const dotRadius = 10;
// ctx.clearRect(0, 0, canvas.width, canvas.height);
function drawDot() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const str in users) {
    const user = users[str] as User;
    // Processing users if needed
    console.log(
      `Drawing User ${user.identity.toHexString()} position:`,
      user.position,
    );
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

// Subscribe to message updates
conn.db.message.onInsert((ctx, message) => {
  console.log(`inserting message ${message.text}`);
  //displayMessage(message);
});

// Function to display a message in the chat box
function displayMessage(message: Message) {
  const chatMessages = document.getElementById("chatMessages");
  console.log(`message: ${message.text}`);
  if (!chatMessages) return;

  // Find the user who sent the message
  const sender = users[message.sender.toHexString()] as User;
  const senderColor = sender ? sender.ballColor : "#FFFFFF";

  // Create the message element
  const messageElement = document.createElement("div");
  messageElement.style.marginBottom = "5px";

  // Format the message with the sender's name
  const timestamp = message.sent.toDate().toLocaleTimeString();
  messageElement.innerHTML = `<span style="color: ${senderColor}; font-weight: bold;">${sender ? sender.name : "Unknown"}</span> <span style="color: #999; font-size: 0.8em;">[${timestamp}]</span>: ${message.text}`;

  // Add the message to the chat box
  chatMessages.appendChild(messageElement);

  // Scroll to the bottom to show the latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
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
  conn.reducers.setPosition(this_user.position.x, this_user.position.y);
  // e.preventDefault();
});
