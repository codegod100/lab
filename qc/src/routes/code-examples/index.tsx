import { component$, useSignal, useStylesScoped$, useVisibleTask$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
// We'll import Prism CSS and JS in the useVisibleTask$

interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
}

export default component$(() => {
  useStylesScoped$(`
    /* Override Prism theme with Catppuccin theme colors */
    :root {
      --code-background: var(--surface0);
      --code-text: var(--text);
      --code-comment: var(--overlay1);
      --code-keyword: var(--mauve);
      --code-function: var(--blue);
      --code-string: var(--green);
      --code-number: var(--peach);
      --code-operator: var(--sky);
      --code-punctuation: var(--overlay2);
      --code-property: var(--yellow);
      --code-tag: var(--red);
      --code-selector: var(--lavender);
      --code-attr-name: var(--sapphire);
      --code-attr-value: var(--teal);
    }

    /* Custom Catppuccin-inspired code highlighting */
    code[class*="language-"],
    pre[class*="language-"] {
      color: var(--code-text);
      background: none;
      font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      font-size: 1em;
      text-align: left;
      white-space: pre;
      word-spacing: normal;
      word-break: normal;
      word-wrap: normal;
      line-height: 1.6;
      tab-size: 2;
      hyphens: none;
    }

    pre[class*="language-"] {
      padding: 1.25em;
      margin: 1em 0;
      overflow: auto;
      border-radius: 10px;
      background: var(--code-background) !important;
      border: 1px solid var(--surface1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    :not(pre) > code[class*="language-"] {
      padding: 0.2em 0.4em;
      border-radius: 0.3em;
      white-space: normal;
      background: var(--code-background);
    }

    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
      color: var(--code-comment);
    }

    .token.punctuation {
      color: var(--code-punctuation);
    }

    .token.namespace {
      opacity: 0.8;
    }

    .token.property,
    .token.tag,
    .token.constant,
    .token.symbol,
    .token.deleted {
      color: var(--code-tag);
    }

    .token.boolean,
    .token.number {
      color: var(--code-number);
    }

    .token.selector,
    .token.attr-name,
    .token.string,
    .token.char,
    .token.builtin,
    .token.inserted {
      color: var(--code-string);
    }

    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
      color: var(--code-operator);
    }

    .token.atrule,
    .token.attr-value,
    .token.keyword {
      color: var(--code-keyword);
    }

    .token.function,
    .token.class-name {
      color: var(--code-function);
    }

    .token.regex,
    .token.important,
    .token.variable {
      color: var(--code-property);
    }

    /* Page Styles */
    .code-examples-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 2.8rem;
      background: linear-gradient(90deg, var(--mauve), var(--pink));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1.5rem;
      letter-spacing: -0.03em;
    }

    .description {
      color: var(--subtext0);
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .example-section {
      margin-bottom: 3rem;
      background: var(--surface0);
      border-radius: 16px;
      border: 1px solid var(--surface1);
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .example-title {
      color: var(--flamingo);
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .example-description {
      color: var(--subtext0);
      margin-bottom: 1.5rem;
      font-size: 1rem;
    }

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--surface1);
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      padding: 0.5rem 1rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      color: var(--subtext1);
    }

    .code-language {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      background: var(--surface2);
      border-radius: 4px;
      color: var(--text);
      font-size: 0.8rem;
      font-weight: bold;
    }

    .code-container {
      position: relative;
    }

    .code-container pre {
      margin-top: 0 !important;
      border-top-left-radius: 0 !important;
      border-top-right-radius: 0 !important;
    }

    .copy-button {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      padding: 0.3rem 0.6rem;
      background: var(--surface2);
      border: none;
      border-radius: 4px;
      color: var(--subtext0);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .copy-button:hover {
      opacity: 1;
      background: var(--surface1);
      color: var(--text);
    }

    .copied {
      background: var(--green) !important;
      color: var(--base) !important;
    }

    .tabs {
      display: flex;
      margin-bottom: 0;
      border-bottom: 1px solid var(--surface1);
    }

    .tab {
      padding: 0.6rem 1.2rem;
      background: transparent;
      border: none;
      color: var(--subtext0);
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 2px solid transparent;
      font-size: 0.9rem;
    }

    .tab:hover {
      color: var(--text);
      background: var(--surface0);
    }

    .tab.active {
      color: var(--mauve);
      border-bottom: 2px solid var(--mauve);
      background: var(--surface0);
    }

    /* Animation for copied feedback */
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `);

  // State for which example is currently being viewed
  const activeTab = useSignal('qwik');
  const copiedStates = useSignal<Record<string, boolean>>({});

  // Code examples
  const codeExamples: Record<string, CodeExample[]> = {
    qwik: [
      {
        id: 'qwik-counter',
        title: 'Qwik Counter Component',
        description: 'A simple counter component using Qwik\'s reactivity system with useSignal and useStore.',
        language: 'tsx',
        code: `import { component$, useSignal, useStore, $ } from '@builder.io/qwik';

export default component$(() => {
  // Simple reactive value
  const count = useSignal(0);
  
  // Complex reactive state
  const state = useStore({
    history: [] as number[],
    lastUpdated: new Date()
  });
  
  // Extracted reactive function
  const updateCounter = $((amount: number) => {
    count.value += amount;
    state.history.push(count.value);
    state.lastUpdated = new Date();
  });

  return (
    <div class="counter">
      <h1>Current count: {count.value}</h1>
      
      <div class="buttons">
        <button onClick$={() => updateCounter(-1)}>Decrement</button>
        <button onClick$={() => updateCounter(1)}>Increment</button>
      </div>
      
      <div class="history">
        <p>History: {state.history.join(', ')}</p>
        <p>Last updated: {state.lastUpdated.toLocaleTimeString()}</p>
      </div>
    </div>
  );
});`
      },
      {
        id: 'qwik-lifecycle',
        title: 'Qwik Lifecycle Hooks',
        description: 'Demonstrates Qwik\'s lifecycle hooks and server/client execution boundaries.',
        language: 'tsx',
        code: `import { component$, useVisibleTask$, useTask$, useSignal } from '@builder.io/qwik';

export default component$(() => {
  const serverCount = useSignal(0);
  const clientCount = useSignal(0);
  
  // Runs on both server and client, whenever dependencies change
  useTask$(({ track }) => {
    // Track the serverCount signal
    track(() => serverCount.value);
    
    console.log('Task running on server or client:', serverCount.value);
    
    // Perform some calculation or side effect
    serverCount.value++;
  });
  
  // Runs ONLY on the client, after component is visible
  useVisibleTask$(({ track }) => {
    // Track the clientCount signal
    track(() => clientCount.value);
    
    console.log('VisibleTask running ONLY on client:', clientCount.value);
    
    // Access browser APIs safely
    if (clientCount.value === 0) {
      clientCount.value = parseInt(localStorage.getItem('count') || '0', 10);
    } else {
      localStorage.setItem('count', clientCount.value.toString());
    }
  });

  return (
    <div>
      <h1>Qwik Lifecycle Demo</h1>
      
      <div>
        <p>Server counter: {serverCount.value}</p>
        <button onClick$={() => serverCount.value++}>
          Increment Server Counter
        </button>
      </div>
      
      <div>
        <p>Client counter: {clientCount.value}</p>
        <button onClick$={() => clientCount.value++}>
          Increment Client Counter
        </button>
      </div>
    </div>
  );
});`
      }
    ],
    typescript: [
      {
        id: 'ts-types',
        title: 'TypeScript Types and Interfaces',
        description: 'Examples of TypeScript types, interfaces, and utility types.',
        language: 'typescript',
        code: `// Basic Types
const name: string = 'Alice';
const age: number = 30;
const isActive: boolean = true;
const skills: string[] = ['TypeScript', 'React', 'Node.js'];
const tuple: [string, number] = ['position', 42];

// Union and Intersection Types
type ID = string | number;
type Employee = Person & { employeeId: number };

// Interfaces
interface Person {
  name: string;
  age: number;
  address?: string; // Optional property
  readonly id: number; // Read-only property
  greet(): string;
}

// Extending Interfaces
interface Developer extends Person {
  skills: string[];
  experience: number;
}

// Implementing Interfaces
class Employee implements Person {
  name: string;
  age: number;
  readonly id: number;
  
  constructor(name: string, age: number, id: number) {
    this.name = name;
    this.age = age;
    this.id = id;
  }
  
  greet(): string {
    return \`Hello, my name is \${this.name}\`;
  }
}

// Generic Types
interface Result<T> {
  data: T;
  error: string | null;
}

function fetchData<T>(url: string): Promise<Result<T>> {
  // Implementation...
  return Promise.resolve({ data: {} as T, error: null });
}

// Utility Types
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

// Partial - all properties optional
const todoUpdate: Partial<Todo> = { completed: true };

// Required - all properties required
const completeTodo: Required<Todo> = {
  title: 'Learn TypeScript',
  description: 'Study advanced types',
  completed: false
};

// Pick - select subset of properties
type TodoPreview = Pick<Todo, 'title' | 'completed'>;

// Omit - remove properties
type TodoBasic = Omit<Todo, 'description'>;

// Record - map-like object type
const todosByDay: Record<string, Todo[]> = {
  monday: [{ title: 'Work', description: '9-5', completed: false }],
  tuesday: [{ title: 'Study', description: 'TypeScript', completed: false }]
};`
      },
      {
        id: 'ts-async',
        title: 'TypeScript Async Patterns',
        description: 'Demonstrates async/await, Promises, and error handling in TypeScript.',
        language: 'typescript',
        code: `// Basic Promise creation
function delay(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

// Async/await function with proper typing
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP Error: \${response.status}\`);
    }
    
    const data: User = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error; // Re-throw for caller to handle
  }
}

// Parallel Promise execution
async function fetchMultipleUsers(userIds: string[]): Promise<User[]> {
  const promises = userIds.map(id => fetchUserData(id));
  return Promise.all(promises);
}

// Sequential Promise execution
async function processUsersSequentially(userIds: string[]): Promise<void> {
  for (const id of userIds) {
    const user = await fetchUserData(id);
    await processUser(user);
  }
}

// Error handling with type checking
async function safelyFetchUser(userId: string): Promise<User | null> {
  try {
    return await fetchUserData(userId);
  } catch (error) {
    if (error instanceof Error) {
      console.error(\`Error message: \${error.message}\`);
    } else {
      console.error('Unknown error type:', error);
    }
    return null;
  }
}

// Using generics with async functions
async function fetchResource<T>(url: string): Promise<T> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(\`Failed to fetch \${url}: \${response.status}\`);
  }
  
  return response.json() as Promise<T>;
}

// Usage example
interface User {
  id: string;
  name: string;
  email: string;
}

async function main() {
  try {
    // Single user fetch
    const user = await fetchUserData('123');
    console.log('User:', user);
    
    // Parallel fetching
    const users = await fetchMultipleUsers(['123', '456', '789']);
    console.log('Total users:', users.length);
    
    // Generic resource fetching
    const posts = await fetchResource<Post[]>('https://api.example.com/posts');
    console.log('Posts:', posts);
  } catch (error) {
    console.error('Main error:', error);
  }
}`
      }
    ],
    css: [
      {
        id: 'css-variables',
        title: 'CSS Variables and Custom Properties',
        description: 'Using modern CSS variables for theming and dynamic styling.',
        language: 'css',
        code: `:root {
  /* Theme colors */
  --primary: #8839ef;
  --secondary: #f5c2e7;
  --accent: #f38ba8;
  --background: #1e1e2e;
  --text: #cdd6f4;
  --muted: #a6adc8;
  
  /* Spacing variables */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2.5rem;
  
  /* Typography */
  --font-family-base: 'Inter', system-ui, sans-serif;
  --font-family-heading: 'Montserrat', sans-serif;
  --font-size-small: 0.875rem;
  --font-size-base: 1rem;
  --font-size-large: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 3rem;
  
  /* Component specific */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  --button-height: 40px;
  --input-height: 40px;
  --sidebar-width: 240px;
  --header-height: 60px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Light theme overrides */
[data-theme="light"] {
  --primary: #8839ef;
  --secondary: #ea76cb;
  --accent: #d20f39;
  --background: #eff1f5;
  --text: #4c4f69;
  --muted: #6c6f85;
}

/* Container with theme variables */
.container {
  background-color: var(--background);
  color: var(--text);
  padding: var(--spacing-md);
  transition: background-color var(--transition-normal), 
              color var(--transition-normal);
}

/* Responsive sizing with CSS variables */
.card {
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-lg);
}

/* Typography using variables */
h1 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  color: var(--primary);
  margin-bottom: var(--spacing-md);
}

p {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--text);
}

/* Buttons using variables */
.button {
  height: var(--button-height);
  padding: 0 var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all var(--transition-fast);
}

.button.primary {
  background-color: var(--primary);
  color: white;
}

.button.secondary {
  background-color: var(--secondary);
  color: var(--background);
}

/* Media queries can also use custom properties */
@media (max-width: 768px) {
  :root {
    --spacing-lg: 1rem; /* Adjust spacing for mobile */
    --font-size-3xl: 2rem; /* Smaller headings on mobile */
  }
  
  .card {
    border-radius: var(--border-radius-sm);
  }
}`
      },
      {
        id: 'css-grid-flex',
        title: 'Modern CSS Layout: Grid and Flexbox',
        description: 'Examples of CSS Grid and Flexbox layouts for modern web applications.',
        language: 'css',
        code: `/* ============= CSS Grid Examples ============= */

/* Basic Grid Layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
  padding: 20px;
}

/* Named Grid Areas */
.dashboard-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
}

.dashboard-header { grid-area: header; }
.dashboard-sidebar { grid-area: sidebar; }
.dashboard-main { grid-area: main; }
.dashboard-footer { grid-area: footer; }

/* Responsive Grid with auto-fill */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* Grid Alignment */
.grid-alignment-example {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  justify-items: center; /* Horizontal alignment within cells */
  align-items: center;   /* Vertical alignment within cells */
}

/* Grid Layout Patterns */
.masonry-like-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 20px;
  grid-auto-flow: dense;
}

.masonry-item {
  /* Items with different span values */
  grid-row-end: span var(--row-span, 10);
}

/* ============= Flexbox Examples ============= */

/* Basic Flex Container */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between; /* Horizontal distribution */
  align-items: center;            /* Vertical alignment */
}

/* Flexbox Navigation */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.nav-links {
  display: flex;
  gap: 20px;
}

/* Flex Direction and Ordering */
.flex-cards {
  display: flex;
  flex-direction: row;     /* Default: horizontal */
  gap: 15px;
}

.card {
  flex: 1 1 300px; /* grow shrink basis */
}

.card.featured {
  order: -1; /* Appears first */
  flex-grow: 2; /* Takes more space */
}

/* Responsive Flex Patterns */
.responsive-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.flex-item {
  flex: 1 1 300px; /* grow shrink basis */
  /* Will wrap when width < 300px */
}

@media (max-width: 768px) {
  .flex-cards {
    flex-direction: column; /* Stack vertically on mobile */
  }
  
  .card {
    flex-basis: auto; /* Reset basis for mobile */
  }
}

/* ============= Combined Layout Example ============= */

.app-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
}

.app-header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.app-sidebar {
  grid-area: sidebar;
  overflow-y: auto;
}

.app-main {
  grid-area: main;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.app-footer {
  grid-area: footer;
  display: flex;
  justify-content: center;
  align-items: center;
}`
      }
    ],
    bash: [
      {
        id: 'bash-scripts',
        title: 'Bash Scripting Examples',
        description: 'Common bash scripting patterns and utilities.',
        language: 'bash',
        code: `#!/bin/bash

# Basic script with variables
NAME="World"
echo "Hello, $NAME!"

# Command substitution
CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"

# Conditional statements
if [ -f "config.json" ]; then
  echo "Configuration file exists"
else
  echo "Configuration file not found"
  exit 1
fi

# Loops
echo "Counting from 1 to 5:"
for i in {1..5}; do
  echo "Number: $i"
done

# While loop with read
echo "Reading file line by line:"
while read -r line; do
  echo "Line: $line"
done < "example.txt"

# Using command line arguments
if [ $# -eq 0 ]; then
  echo "No arguments provided"
  exit 1
fi

echo "First argument: $1"
echo "All arguments: $@"
echo "Number of arguments: $#"

# Functions
function greet() {
  local name=$1
  echo "Hello, $name!"
}

greet "John"

# Error handling
set -e  # Exit immediately if a command exits with non-zero status

# Trap for cleanup
function cleanup() {
  echo "Cleaning up temporary files..."
  rm -f temp_*.txt
}

trap cleanup EXIT

# Create temporary files
touch temp_1.txt temp_2.txt
echo "Temporary files created"

# Process arguments with getopts
while getopts ":hv:o:" opt; do
  case $opt in
    h)
      echo "Usage: $0 [-h] [-v version] [-o output]"
      exit 0
      ;;
    v)
      VERSION=$OPTARG
      echo "Version set to: $VERSION"
      ;;
    o)
      OUTPUT=$OPTARG
      echo "Output set to: $OUTPUT"
      ;;
    \?)
      echo "Invalid option: -$OPTARG"
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument"
      exit 1
      ;;
  esac
done

# Working with files and directories
mkdir -p output/logs
find ./src -name "*.js" -type f | xargs grep "TODO" > output/logs/todos.txt

# Running commands in parallel
echo "Running parallel commands:"
{
  sleep 2 && echo "Command 1 finished" &
  sleep 1 && echo "Command 2 finished" &
  wait
}
echo "All commands completed"`
      }
    ]
  };

  // Copy code to clipboard
  const copyToClipboard = $((code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      // Set copied state for this specific example
      const newCopiedStates = { ...copiedStates.value };
      newCopiedStates[id] = true;
      copiedStates.value = newCopiedStates;
      
      // Reset after 2 seconds
      setTimeout(() => {
        const resetStates = { ...copiedStates.value };
        resetStates[id] = false;
        copiedStates.value = resetStates;
      }, 2000);
    });
  });

  // Pre-highlight the code examples with Prism on the client
  const highlightedExamples = useSignal<Record<string, string>>({});
  
  useVisibleTask$(async () => {
    // Dynamically import Prism and themes
    const Prism = await import('prismjs');
    
    // Import language components
    await Promise.all([
      import('prismjs/components/prism-typescript'),
      import('prismjs/components/prism-jsx'),
      import('prismjs/components/prism-tsx'),
      import('prismjs/components/prism-json'),
      import('prismjs/components/prism-css'),
      import('prismjs/components/prism-bash')
    ]);
    
    // Import theme CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css';
    document.head.appendChild(linkElement);
    
    // Pre-highlight all code examples
    const highlighted: Record<string, string> = {};
    
    for (const category in codeExamples) {
      for (const example of codeExamples[category]) {
        const html = Prism.default.highlight(
          example.code,
          Prism.default.languages[example.language],
          example.language
        );
        highlighted[example.id] = html;
      }
    }
    
    highlightedExamples.value = highlighted;
  });

  return (
    <div class="code-examples-container">
      <h1 class="page-title">Code Examples</h1>
      <p class="description">
        Explore various code examples with syntax highlighting. These examples showcase different programming 
        languages and techniques, all styled with the Catppuccin theme.
      </p>

      {/* Language tabs */}
      <div class="tabs">
        <button 
          class={`tab ${activeTab.value === 'qwik' ? 'active' : ''}`} 
          onClick$={() => activeTab.value = 'qwik'}
        >
          Qwik
        </button>
        <button 
          class={`tab ${activeTab.value === 'typescript' ? 'active' : ''}`} 
          onClick$={() => activeTab.value = 'typescript'}
        >
          TypeScript
        </button>
        <button 
          class={`tab ${activeTab.value === 'css' ? 'active' : ''}`} 
          onClick$={() => activeTab.value = 'css'}
        >
          CSS
        </button>
        <button 
          class={`tab ${activeTab.value === 'bash' ? 'active' : ''}`} 
          onClick$={() => activeTab.value = 'bash'}
        >
          Bash
        </button>
      </div>

      {/* Code examples for the selected language */}
      {codeExamples[activeTab.value].map((example) => (
        <section key={example.id} class="example-section">
          <h2 class="example-title">{example.title}</h2>
          <p class="example-description">{example.description}</p>
          
          <div class="code-container">
            <div class="code-header">
              <span class="code-language">{example.language}</span>
            </div>
            <pre class={`language-${example.language}`}>
              {highlightedExamples.value[example.id] ? (
                <code 
                  class={`language-${example.language}`}
                  dangerouslySetInnerHTML={highlightedExamples.value[example.id]}
                ></code>
              ) : (
                <code class={`language-${example.language}`}>{example.code}</code>
              )}
            </pre>
            <button 
              class={`copy-button ${copiedStates.value[example.id] ? 'copied' : ''}`}
              onClick$={() => copyToClipboard(example.code, example.id)}
            >
              {copiedStates.value[example.id] ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>
      ))}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Code Examples | Qwik App",
  meta: [
    {
      name: "description",
      content: "Syntax highlighted code examples in various programming languages",
    },
  ],
};