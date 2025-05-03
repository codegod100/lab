// This module provides a safe import for Tauri's shell API if available, or a graceful fallback for the web.
let open: (url: string) => Promise<void>;

try {
  // @ts-ignore
  // Dynamically require to avoid breaking web builds
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  open = require('@tauri-apps/api/shell').open;
} catch (e) {
  // Fallback for web: open in new tab
  open = async (url: string) => {
    window.open(url, '_blank', 'noopener');
  };
}

export { open };
