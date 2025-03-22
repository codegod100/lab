import { component$, useSignal, useStylesScoped$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const count = useSignal(0);
  const colorIndex = useSignal(0);
  const catppuccinColors = ['#f5c2e7', '#cba6f7', '#f38ba8', '#fab387', '#a6e3a1', '#74c7ec'];

  useStylesScoped$(`
    /* Catppuccin color variables are defined in layout.tsx */
    .container {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .heading {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      transition: color 0.3s ease;
      letter-spacing: -0.03em;
      background: linear-gradient(90deg, var(--mauve), var(--pink));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .description {
      font-size: 1.2rem;
      margin-bottom: 2.5rem;
      color: var(--subtext0);
      line-height: 1.6;
    }

    .button-container {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 3rem;
    }

    .button {
      padding: 0.8rem 1.5rem;
      font-size: 1rem;
      border-radius: 8px;
      color: var(--base);
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }

    .count-button {
      background: var(--mauve);
    }

    .reset-button {
      background: var(--surface1);
      color: var(--text);
    }

    .features-container {
      background: var(--surface0);
      padding: 2rem;
      border-radius: 16px;
      border: 1px solid var(--surface1);
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .features-container h2 {
      color: var(--flamingo);
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .features-list {
      text-align: left;
      line-height: 1.8;
      color: var(--text);
    }

    .features-list li {
      margin-bottom: 0.5rem;
      position: relative;
      padding-left: 1.5rem;
    }

    .features-list li:before {
      content: '✨';
      position: absolute;
      left: 0;
      font-size: 0.8rem;
    }
  `);

  return (
    <div class="container">
      <h1 class="heading">
        Welcome to Qwik! 🚀
      </h1>
      
      <p class="description">
        This is your super-charged, interactive Qwik application styled with the Catppuccin theme.
      </p>

      <div class="button-container">
        <button 
          class="button count-button"
          onClick$={() => {
            count.value++;
            colorIndex.value = (colorIndex.value + 1) % catppuccinColors.length;
          }}
          style={{ background: catppuccinColors[colorIndex.value] }}
        >
          Count: {count.value}
        </button>
        
        <button 
          class="button reset-button"
          onClick$={() => {
            count.value = 0;
            colorIndex.value = 0;
          }}
        >
          Reset
        </button>
      </div>

      <div class="features-container">
        <h2>Features to explore:</h2>
        <ul class="features-list">
          <li>State management with signals</li>
          <li>Interactive components</li>
          <li>Styling with Catppuccin theme</li>
          <li>Routing with Qwik City</li>
          <li>Optimizing for performance</li>
        </ul>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Qwik App | Home",
  meta: [
    {
      name: "description",
      content: "An interactive Qwik application with Catppuccin styling",
    },
  ],
};
