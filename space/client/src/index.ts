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
const name_div = document.getElementById("name") as HTMLDivElement
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
      drawDot();
      this_user = ctx.db.user.identity.find(identity) as User;
      name_div.innerHTML = `Hello ${this_user.name} <button id="update-name">Update name</button>`
      let button = document.getElementById("update-name") as HTMLButtonElement
      button.addEventListener('click', ()=>{
        let name = prompt("What name do you want?") as string
        conn.reducers.setName(name)
        name_div.innerHTML = `Hello ${name} <button id="update-name">Update name</button>`
      })
      if(!this_user.name){
        let name = prompt("What name do you want?") as string
        conn.reducers.setName(name)
      }
    })
    .subscribe("select * from user");

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

conn.db.user.onUpdate((ctx, prev, current) => {
  if (prev.position !== current.position) {
    let ident_string = current.identity.toHexString()
    users[ident_string] = current;
    console.log(
      `User ${current.name || ident_string} updated position:`,
      prev.position,
      current.position,
    );
    drawDot();
  }
});




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
    // console.log(
    //   `Drawing User ${user.identity.toHexString()} position:`,
    //   user.position,
    // );
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
  e.preventDefault();
});
