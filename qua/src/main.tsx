/** @jsxImportSource preact */
import { h, render, FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Router from 'preact-router';

interface Repo {
  id: number;
  name: string;
  html_url: string;
}
import PongGame from './PongGame';
import ThreeCanvas from './ThreeCanvas';

const App: FunctionalComponent = () => {
  const [count, setCount] = useState(0);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 5;

  const totalPages = Math.ceil(repos.length / reposPerPage);
  const startIndex = (currentPage - 1) * reposPerPage;
  const endIndex = startIndex + reposPerPage;
  const currentRepos = repos.slice(startIndex, endIndex);

  const [theme, setTheme] = useState('light');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  const avatarUrl = "https://upload.wikimedia.org/wikipedia/commons/7/77/Avatar_Abbas_-_cartoon_transparent_200px.png";

  async function fetchImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('Failed to convert blob to base64 string');
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  useEffect(() => {
    fetch('https://api.github.com/users/codegod100/repos')
      .then((res) => res.json())
      .then((data) => setRepos(data))
      .catch((err) => console.error('Failed to fetch repos', err));
  }, []);

  useEffect(() => {
    fetchImageAsBase64(avatarUrl)
      .then((base64) => setAvatarBase64(base64))
      .catch((err) => console.error('Failed to convert avatar to base64', err));
  }, []);

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
          <a href="/tab1" class="tab">Tab 1</a>
          <a href="/tab2" class="tab">Tab 2</a>
          <a href="/tab3" class="tab">Tab 3</a>
        </div>

        <Router>
          <div path="/tab1" class="mt-4 p-4 border rounded">
            <h2 class="text-lg font-bold mb-2">codegod100's GitHub Repositories</h2>
            {repos.length === 0 ? (
              <p>Loading repositories...</p>
            ) : (
              <>
                <ul class="list-disc pl-5 space-y-1">
                  {currentRepos.map((repo) => (
                    <li key={repo.id}>
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" class="link link-primary">
                        {repo.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <div class="mt-4 flex justify-center space-x-2">
                  <button
                    class="btn btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    class="btn btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
          <div path="/tab2" class="mt-4 p-4 border rounded flex justify-center items-center min-h-[200px]">
            <div class="glitch" data-text="GLITCH EFFECT">GLITCH EFFECT</div>
          </div>
          <div path="/tab3" class="mt-4 p-4 border rounded">
            <p>This is content for Tab 3.</p>
          </div>
          <div default class="mt-4 p-4 border rounded">
            <p>Welcome! Select a tab.</p>
          </div>
        </Router>

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
            <img src={avatarBase64 ? avatarBase64 : avatarUrl} alt="avatar" />
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