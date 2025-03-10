// Generate a random color
const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Display a cyberpunk gradient message
const text = "Hello, Cyberpunk World!";
let rainbowText = '';

// Color points for cyberpunk gradient
const colorPoints = [
  [255, 0, 128],    // hot pink
  [0, 255, 255],    // cyan
  [255, 102, 0],    // neon orange
  [128, 0, 255],    // purple
  [0, 255, 128]     // electric green
];

// Create smooth gradient
for (let i = 0; i < text.length; i++) {
  // Calculate position in the gradient (0 to 1)
  const position = i / (text.length - 1);
  // Calculate the position in our color array
  const colorPosition = position * (colorPoints.length - 1);
  
  // Find the two colors to interpolate between
  const colorIndex = Math.floor(colorPosition);
  const nextColorIndex = Math.min(colorIndex + 1, colorPoints.length - 1);
  
  // Calculate how far between the two colors (0 to 1)
  const colorRatio = colorPosition - colorIndex;
  
  // Interpolate between the two colors
  const r = Math.round(colorPoints[colorIndex][0] * (1 - colorRatio) + colorPoints[nextColorIndex][0] * colorRatio);
  const g = Math.round(colorPoints[colorIndex][1] * (1 - colorRatio) + colorPoints[nextColorIndex][1] * colorRatio);
  const b = Math.round(colorPoints[colorIndex][2] * (1 - colorRatio) + colorPoints[nextColorIndex][2] * colorRatio);
  
  rainbowText += `\x1b[38;2;${r};${g};${b}m${text[i]}`;
}

console.log(rainbowText + '\x1b[0m');

// Create ASCII art cyberpunk rocket with colors
const asciiArt = () => {
  // Cyberpunk colors
  const pink = '\x1b[38;2;255;0;128m';
  const cyan = '\x1b[38;2;0;255;255m';
  const orange = '\x1b[38;2;255;102;0m';
  const purple = '\x1b[38;2;128;0;255m';
  const green = '\x1b[38;2;0;255;128m';
  const reset = '\x1b[0m';
  
  return `
    ${pink}/\\${reset}
   ${pink}/  \\${reset}
  ${cyan}|${orange}    ${cyan}|${reset}
  ${cyan}|${purple}====${cyan}|${reset}
  ${cyan}|${orange}    ${cyan}|${reset}
 ${pink}/${cyan}|${orange}    ${cyan}|${pink}\\${reset}
${pink}/ ${cyan}|${purple}====${cyan}| ${pink}\\${reset}
${green}= ${cyan}|${orange}    ${cyan}| ${green}=${reset}
  ${cyan}|${orange}    ${cyan}|${reset}
  ${cyan}|${purple}____${cyan}|${reset}
 ${pink}/${orange}      ${pink}\\${reset}
${pink}/${orange}        ${pink}\\${reset}
${cyan}^^^^^^^^^^^^${reset}
`;
};

console.log(asciiArt());

// Current time
console.log("Current time:", new Date().toLocaleTimeString());