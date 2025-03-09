#!/usr/bin/env node

const readline = require('readline');

// ANSI color codes for cyberpunk theme
const colors = {
  prompt: '\x1b[38;2;0;255;255m',  // cyan
  input: '\x1b[38;2;255;0;128m',   // hot pink
  output: '\x1b[38;2;0;255;128m',  // electric green
  error: '\x1b[38;2;255;102;0m',   // neon orange
  system: '\x1b[38;2;128;0;255m',  // purple
  reset: '\x1b[0m'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Commands available in the fake shell
const commands = {
  help: () => {
    return `Available commands:
  help - Show this help message
  echo [text] - Echo the text
  whoami - Display current user
  date - Show current date and time
  ls - List available commands
  clear - Clear the screen
  fortune - Get a random fortune
  hack [target] - Simulate hacking a target system
  exit - Exit the shell`;
  },
  
  echo: (args) => {
    return args.join(' ');
  },
  
  whoami: () => {
    return 'cyberpunk-user';
  },
  
  date: () => {
    return new Date().toLocaleString();
  },
  
  ls: () => {
    return Object.keys(commands).join('\n');
  },
  
  clear: () => {
    process.stdout.write('\x1bc');
    return '';
  },
  
  fortune: () => {
    const fortunes = [
      "The future is already here — it's just not evenly distributed.",
      "The sky above the port was the color of television, tuned to a dead channel.",
      "It's not the age of information. It's the age of disinformation.",
      "The function of art is to hold a mirror up to nature.",
      "Reality is that which, when you stop believing in it, doesn't go away.",
      "Cyberspace. A consensual hallucination experienced daily by billions."
    ];
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  },
  
  hack: (args) => {
    const target = args.length > 0 ? args.join(' ') : 'unknown';
    
    // Don't block the event loop with fake animation
    process.stdout.write(colors.system + `Initiating hack on target: ${target}\n`);
    
    const steps = [
      'Bypassing firewall...',
      'Scanning for vulnerabilities...',
      'Exploiting known CVEs...',
      'Escalating privileges...',
      'Establishing backdoor...',
      'Extracting data...',
      'Covering tracks...'
    ];
    
    let currentStep = 0;
    
    // Create a fake progress animation
    const hackInterval = setInterval(() => {
      if (currentStep < steps.length) {
        // Generate random percentage
        const progress = Math.floor(Math.random() * 101);
        process.stdout.write(`${colors.output}${steps[currentStep]} ${progress}%${colors.reset}\r`);
        
        // Move to next step randomly
        if (progress > 90) {
          process.stdout.write(`${colors.output}${steps[currentStep]} Completed${colors.reset}\n`);
          currentStep++;
        }
      } else {
        clearInterval(hackInterval);
        process.stdout.write(`${colors.system}Hack complete! Access granted to ${target}${colors.reset}\n`);
      }
    }, 400);
    
    // Return immediately, animation happens asynchronously
    return 'Hack initiated...';
  },
  
  exit: () => {
    console.log(colors.system + 'Disconnecting from matrix...' + colors.reset);
    rl.close();
    process.exit(0);
  }
};

// Display welcome message
console.log(colors.system + `
╔══════════════════════════════════════════╗
║                                          ║
║       CYBERPUNK TERMINAL v1.0.0          ║
║                                          ║
║         [Type 'help' for info]           ║
║                                          ║
╚══════════════════════════════════════════╝
` + colors.reset);

// Main REPL loop
function prompt() {
  rl.question(colors.prompt + '> ' + colors.input, (input) => {
    console.log(colors.reset);
    
    const [command, ...args] = input.trim().split(' ');
    
    if (command === '') {
      prompt();
      return;
    }
    
    if (commands[command]) {
      try {
        const output = commands[command](args);
        if (output) {
          console.log(colors.output + output + colors.reset);
        }
      } catch (error) {
        console.log(colors.error + 'Error executing command: ' + error.message + colors.reset);
      }
    } else {
      console.log(colors.error + `Command not found: ${command}. Type 'help' for available commands.` + colors.reset);
    }
    
    prompt();
  });
}

// Start the REPL
prompt();