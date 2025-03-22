import { component$, Slot, useSignal, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  const isDarkMode = useSignal(true); // Dark mode by default

  // Apply theme on initial load and when toggled
  useVisibleTask$(({ track }) => {
    track(() => isDarkMode.value);
    
    const body = document.body;
    if (isDarkMode.value) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  });

  useStylesScoped$(`
    /* Catppuccin color palette */
    :root, .dark-theme {
      /* Dark theme (Catppuccin Mocha) */
      --rosewater: #f5e0dc;
      --flamingo: #f2cdcd;
      --pink: #f5c2e7;
      --mauve: #cba6f7;
      --red: #f38ba8;
      --maroon: #eba0ac;
      --peach: #fab387;
      --yellow: #f9e2af;
      --green: #a6e3a1;
      --teal: #94e2d5;
      --sky: #89dceb;
      --sapphire: #74c7ec;
      --blue: #89b4fa;
      --lavender: #b4befe;
      --text: #cdd6f4;
      --subtext1: #bac2de;
      --subtext0: #a6adc8;
      --overlay2: #9399b2;
      --overlay1: #7f849c;
      --overlay0: #6c7086;
      --surface2: #585b70;
      --surface1: #45475a;
      --surface0: #313244;
      --base: #1e1e2e;
      --mantle: #181825;
      --crust: #11111b;
    }

    .light-theme {
      /* Light theme (Catppuccin Latte) */
      --rosewater: #dc8a78;
      --flamingo: #dd7878;
      --pink: #ea76cb;
      --mauve: #8839ef;
      --red: #d20f39;
      --maroon: #e64553;
      --peach: #fe640b;
      --yellow: #df8e1d;
      --green: #40a02b;
      --teal: #179299;
      --sky: #04a5e5;
      --sapphire: #209fb5;
      --blue: #1e66f5;
      --lavender: #7287fd;
      --text: #4c4f69;
      --subtext1: #5c5f77;
      --subtext0: #6c6f85;
      --overlay2: #7c7f93;
      --overlay1: #8c8fa1;
      --overlay0: #9ca0b0;
      --surface2: #acb0be;
      --surface1: #bcc0cc;
      --surface0: #ccd0da;
      --base: #eff1f5;
      --mantle: #e6e9ef;
      --crust: #dce0e8;
    }

    .layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: 'Roboto', system-ui, sans-serif;
      background-color: var(--base);
      color: var(--text);
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .header {
      background: var(--mantle);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid var(--surface0);
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 1.5rem;
    }

    .left-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--mauve);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: color 0.3s ease;
    }

    .logo:before {
      content: '🌸';
    }

    .nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .nav-link {
      color: var(--subtext1);
      text-decoration: none;
      padding: 0.5rem 1rem;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      position: relative;
      letter-spacing: 0.5px;
    }

    .nav-link:hover {
      color: var(--text);
      background-color: var(--surface0);
    }

    .nav-link:after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: 0;
      left: 50%;
      background-color: var(--pink);
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    .nav-link:hover:after {
      width: 80%;
    }

    .main {
      flex: 1;
      background-color: var(--base);
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: 2rem 1.5rem;
      transition: background-color 0.3s ease;
    }

    .footer {
      background-color: var(--mantle);
      border-top: 1px solid var(--surface0);
      padding: 1.5rem;
      text-align: center;
      font-size: 0.9rem;
      color: var(--overlay1);
      transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: 1.5rem;
    }

    .toggle-button {
      background: var(--surface0);
      border: none;
      cursor: pointer;
      width: 3rem;
      height: 1.5rem;
      border-radius: 1rem;
      position: relative;
      transition: background-color 0.3s ease;
    }

    .toggle-button:before {
      content: '';
      position: absolute;
      top: 0.15rem;
      left: 0.15rem;
      width: 1.2rem;
      height: 1.2rem;
      border-radius: 50%;
      background: var(--overlay2);
      transition: all 0.3s ease;
    }

    .dark-theme .toggle-button:before {
      background: var(--yellow);
      transform: translateX(0);
    }

    .light-theme .toggle-button:before {
      background: var(--blue);
      transform: translateX(1.5rem);
    }

    .toggle-icon {
      font-size: 1.2rem;
    }
  `);

  return (
    <div class="layout">
      <header class="header">
        <div class="nav-container">
          <div class="left-section">
            <Link href="/" class="logo">
              Qwik App
            </Link>
          </div>
          <nav class="nav">
            <Link href="/" class="nav-link">
              Home
            </Link>
            <Link href="/about/" class="nav-link">
              About
            </Link>
            <Link href="/playground/" class="nav-link">
              Playground
            </Link>
            <Link href="/code-examples/" class="nav-link">
              Code Examples
            </Link>
            <div class="theme-toggle">
              <span class="toggle-icon">{isDarkMode.value ? '🌙' : '☀️'}</span>
              <button 
                class="toggle-button"
                onClick$={() => {
                  isDarkMode.value = !isDarkMode.value;
                }}
                aria-label={isDarkMode.value ? "Switch to light mode" : "Switch to dark mode"}
              />
            </div>
          </nav>
        </div>
      </header>
      
      <main class="main">
        <Slot />
      </main>
      
      <footer class="footer">
        <p>© {new Date().getFullYear()} Qwik App. All rights reserved.</p>
      </footer>
    </div>
  );
});
