/** @jsxImportSource preact */
import { h, render, FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import PongGame from './PongGame';
import ThreeCanvas from './ThreeCanvas';

const App: FunctionalComponent = () => {
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useState('light');

  const themes = [
    'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
    'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween',
    'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe',
    'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid',
    'lemonade', 'night', 'coffee', 'winter'
  ];

  const handleThemeChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value;
    setTheme(value);
    document.documentElement.setAttribute('data-theme', value);
    localStorage.setItem('theme', value);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  return (
    <div class="flex flex-col min-h-screen bg-base-200">
      <div class="navbar bg-primary text-primary-content">
        <a class="btn btn-ghost text-xl">DaisyUI Showcase</a>
        <select
          class="select select-bordered select-md ml-auto mr-4 text-base-content"
          value={theme}
          onChange={handleThemeChange}
        >
          {themes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <main class="flex-grow flex flex-col items-center justify-start p-6 space-y-8 overflow-y-auto">
        <div class="card w-96 bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Welcome to My Website</h2>
            <p>This landing page demonstrates DaisyUI components with Preact integration.</p>
            <div class="card-actions justify-end">
              <button class="btn btn-primary">Primary Action</button>
              <button class="btn btn-secondary">Secondary Action</button>
            </div>
          </div>
        </div>

        <div class="tabs tabs-boxed">
          {['Tab 1', 'Tab 2', 'Tab 3'].map((label, idx) => (
            <a
              key={idx}
              class={`tab ${activeTab === idx ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              {label}
            </a>
          ))}
        </div>

        <div class="mt-4 p-4 border rounded">
          {activeTab === 0 && <p>This is content for Tab 1.</p>}
          {activeTab === 1 && <p>This is content for Tab 2.</p>}
          {activeTab === 2 && <p>This is content for Tab 3.</p>}
        </div>

        <div class="space-x-2">
          <span class="badge badge-primary">Primary</span>
          <span class="badge badge-secondary">Secondary</span>
          <span class="badge badge-accent">Accent</span>
          <span class="badge badge-info">Info</span>
          <span class="badge badge-success">Success</span>
          <span class="badge badge-warning">Warning</span>
          <span class="badge badge-error">Error</span>
        </div>

        <progress class="progress progress-primary w-56" value="40" max="100"></progress>
        <progress class="progress progress-secondary w-56" value="60" max="100"></progress>

        <div class="avatar">
          <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/77/Avatar_Abbas_-_cartoon_transparent_200px.png" alt="avatar" />
          </div>
        </div>

        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Downloads</div>
            <div class="stat-value">31K</div>
            <div class="stat-desc">Jan 1st - Feb 1st</div>
          </div>
          <div class="stat">
            <div class="stat-title">Users</div>
            <div class="stat-value">4,200</div>
            <div class="stat-desc">↗︎ 400 (22%)</div>
          </div>
          <div class="stat">
            <div class="stat-title">New Registers</div>
            <div class="stat-value">1,200</div>
            <div class="stat-desc">↘︎ 90 (7%)</div>
          </div>
        </div>

        <div class="alert alert-success shadow-lg w-full max-w-md">
          <span>Success! Your action was successful.</span>
        </div>

        <div class="dropdown">
          <label tabIndex={0} class="btn m-1">Dropdown</label>
          <ul tabIndex={0} class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
            <li><a>Item 3</a></li>
          </ul>
        </div>

        <PongGame />
        <ThreeCanvas />
      </main>

      <footer class="footer footer-center p-4 bg-primary text-primary-content">
        <div>
          <p>© 2025 My Website. Built with DaisyUI and Preact.</p>
        </div>
      </footer>
    </div>
  );
};

const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}