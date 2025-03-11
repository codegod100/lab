// place files you want to import through the `$lib` alias in this folder.
import {
  DbConnection,
  type EventContext,
  Message,
  User,
  SetName,
} from "../module_bindings";
import { Identity } from "@clockworklabs/spacetimedb-sdk";
export function drawDot(canvas: HTMLCanvasElement, users: Map<string, User>) {
  const dotRadius = 10;
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
// export function displayMessage(message: Message) {
//   const chatMessages = document.getElementById("chatMessages");
//   console.log(`message: ${message.text}`);
//   if (!chatMessages) return;

//   // Find the user who sent the message
//   const sender = users[message.sender.toHexString()] as User;
//   const senderColor = sender ? sender.ballColor : "#FFFFFF";

//   // Create the message element
//   const messageElement = document.createElement("div");
//   messageElement.style.marginBottom = "5px";

//   // Format the message with the sender's name
//   const timestamp = message.sent.toDate().toLocaleTimeString();
//   messageElement.innerHTML = `<span style="color: ${senderColor}; font-weight: bold;">${sender ? sender.name : "Unknown"}</span> <span style="color: #999; font-size: 0.8em;">[${timestamp}]</span>: ${message.text}`;

//   // Add the message to the chat box
//   chatMessages.appendChild(messageElement);

//   // Scroll to the bottom to show the latest message
//   chatMessages.scrollTop = chatMessages.scrollHeight;
// }
