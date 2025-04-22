import { writable } from 'svelte/store';

export interface Settings {
  showHiddenFiles: boolean;
  sortBy: 'name' | 'size' | 'type' | 'modified';
  sortDirection: 'asc' | 'desc';
  viewMode: 'list' | 'grid' | 'details';
  splitView: boolean;
  theme: 'light' | 'dark' | 'system';
}

const defaultSettings: Settings = {
  showHiddenFiles: false,
  sortBy: 'name',
  sortDirection: 'asc',
  viewMode: 'details',
  splitView: true,
  theme: 'system',
};

function createSettingsStore() {
  // Try to load settings from localStorage
  let initialSettings = defaultSettings;
  
  try {
    const savedSettings = localStorage.getItem('fileman_settings');
    if (savedSettings) {
      initialSettings = { ...defaultSettings, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  
  const { subscribe, set, update } = writable<Settings>(initialSettings);
  
  // Save settings to localStorage whenever they change
  subscribe(settings => {
    try {
      localStorage.setItem('fileman_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  });
  
  return {
    subscribe,
    
    toggleHiddenFiles: () => update(settings => ({
      ...settings,
      showHiddenFiles: !settings.showHiddenFiles,
    })),
    
    setSortBy: (sortBy: Settings['sortBy']) => update(settings => ({
      ...settings,
      sortBy,
      // If clicking the same sort column, toggle direction
      sortDirection: settings.sortBy === sortBy 
        ? (settings.sortDirection === 'asc' ? 'desc' : 'asc')
        : settings.sortDirection,
    })),
    
    setViewMode: (viewMode: Settings['viewMode']) => update(settings => ({
      ...settings,
      viewMode,
    })),
    
    toggleSplitView: () => update(settings => ({
      ...settings,
      splitView: !settings.splitView,
    })),
    
    setTheme: (theme: Settings['theme']) => update(settings => ({
      ...settings,
      theme,
    })),
    
    reset: () => set(defaultSettings),
  };
}

export const settings = createSettingsStore();
