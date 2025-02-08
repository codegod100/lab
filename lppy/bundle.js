// node_modules/@luca/flag/main.js
var colors = {
  l: "#74D7EE",
  p: "#FFAFC8",
  w: "#FFFFFF",
  b: "#613915",
  B: "#000000",
  r: "#E40303",
  o: "#FF8C00",
  y: "#FFED00",
  g: "#008026",
  i: "#24408E",
  v: "#732982"
};
var progressFlag = `
lbbbbbBBBBBrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
lllbbbbbBBBBBrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
lllllbbbbbBBBBBrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
pplllllbbbbbBBBBBrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
pppplllllbbbbbBBBBBooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
wppppplllllbbbbbBBBBBooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
wwwppppplllllbbbbbBBBBBooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
wwwwwppppplllllbbbbbBBBBBooooooooooooooooooooooooooooooooooooooooooooooooooooooo
wwwwwwwppppplllllbbbbbBBBBByyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
wwwwwwwwwppppplllllbbbbbBBBBByyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
wwwwwwwwwwwppppplllllbbbbbBBBBByyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
wwwwwwwwwwwwwppppplllllbbbbbBBBBByyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
wwwwwwwwwwwwwppppplllllbbbbbBBBBBggggggggggggggggggggggggggggggggggggggggggggggg
wwwwwwwwwwwppppplllllbbbbbBBBBBggggggggggggggggggggggggggggggggggggggggggggggggg
wwwwwwwwwppppplllllbbbbbBBBBBggggggggggggggggggggggggggggggggggggggggggggggggggg
wwwwwwwppppplllllbbbbbBBBBBggggggggggggggggggggggggggggggggggggggggggggggggggggg
wwwwwppppplllllbbbbbBBBBBiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
wwwppppplllllbbbbbBBBBBiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
wppppplllllbbbbbBBBBBiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
pppplllllbbbbbBBBBBiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
pplllllbbbbbBBBBBvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
lllllbbbbbBBBBBvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
lllbbbbbBBBBBvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
lbbbbbBBBBBvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
`;
function printProgress() {
  const flag = progressFlag.trim();
  const lines = flag.split(`
`);
  for (const line of lines) {
    let print = "";
    const csses = [];
    for (const char of line) {
      const color = colors[char];
      print += `%c %c`;
      csses.push(`background-color: ${color}`, "");
    }
    console.log(print, ...csses);
  }
}
if (false) {
}

// lib.js
function foo() {
  return globalThis.location.href;
}
export {
  printProgress,
  foo
};
