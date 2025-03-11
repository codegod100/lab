// let ident;
// let x;
// let y;
// let ballColor;
const name_div = document.getElementById("name") as HTMLDivElement;

let this_user: User;

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

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

const speed = 5;
const dotRadius = 10;
// ctx.clearRect(0, 0, canvas.width, canvas.height);

// Subscribe to message updates
conn.db.message.onInsert((ctx, message) => {
  if (ctx.event.tag != "Reducer") return;
  console.log(`inserting message ${message.text}`);
  displayMessage(message);
});

// Function to display a message in the chat box

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
