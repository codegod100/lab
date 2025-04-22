import { writable } from 'svelte/store';

export type ViewMode = 'list' | 'grid' | 'details';

export interface PaneSettings {
  viewMode: ViewMode;
  sortBy: 'name' | 'size' | 'type' | 'modified';
  sortDirection: 'asc' | 'desc';
}

export interface Settings {
  showHiddenFiles: boolean;
  splitView: boolean;
  theme: 'light' | 'dark' | 'system';
  // Default settings applied to both panes
  defaultSortBy: 'name' | 'size' | 'type' | 'modified';
  defaultSortDirection: 'asc' | 'desc';
  defaultViewMode: ViewMode;
  // Per-pane settings
  leftPane: PaneSettings;
  rightPane: PaneSettings;
}

const defaultPaneSettings: PaneSettings = {
  viewMode: 'details',
  sortBy: 'name',
  sortDirection: 'asc',
};

const defaultSettings: Settings = {
  showHiddenFiles: false,
  splitView: true,
  theme: 'system',
  defaultSortBy: 'name',
  defaultSortDirection: 'asc',
  defaultViewMode: 'details',
  leftPane: { ...defaultPaneSettings },
  rightPane: { ...defaultPaneSettings },
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

    setSortBy: (sortBy: PaneSettings['sortBy'], pane?: 'left' | 'right') => update(settings => {
      if (pane) {
        // Update specific pane
        const paneKey = pane === 'left' ? 'leftPane' : 'rightPane';
        return {
          ...settings,
          [paneKey]: {
            ...settings[paneKey],
            sortBy,
            // If clicking the same sort column, toggle direction
            sortDirection: settings[paneKey].sortBy === sortBy
              ? (settings[paneKey].sortDirection === 'asc' ? 'desc' : 'asc')
              : settings[paneKey].sortDirection,
          }
        };
      } else {
        // Update default and both panes
        return {
          ...settings,
          defaultSortBy: sortBy,
          // If clicking the same sort column, toggle direction
          defaultSortDirection: settings.defaultSortBy === sortBy
            ? (settings.defaultSortDirection === 'asc' ? 'desc' : 'asc')
            : settings.defaultSortDirection,
          leftPane: {
            ...settings.leftPane,
            sortBy,
            sortDirection: settings.defaultSortBy === sortBy
              ? (settings.defaultSortDirection === 'asc' ? 'desc' : 'asc')
              : settings.defaultSortDirection,
          },
          rightPane: {
            ...settings.rightPane,
            sortBy,
            sortDirection: settings.defaultSortBy === sortBy
              ? (settings.defaultSortDirection === 'asc' ? 'desc' : 'asc')
              : settings.defaultSortDirection,
          }
        };
      }
    }),

    setViewMode: (viewMode: ViewMode, pane?: 'left' | 'right') => update(settings => {
      if (pane) {
        // Update specific pane
        const paneKey = pane === 'left' ? 'leftPane' : 'rightPane';
        return {
          ...settings,
          [paneKey]: {
            ...settings[paneKey],
            viewMode,
          }
        };
      } else {
        // Update default and both panes
        return {
          ...settings,
          defaultViewMode: viewMode,
          leftPane: {
            ...settings.leftPane,
            viewMode,
          },
          rightPane: {
            ...settings.rightPane,
            viewMode,
          }
        };
      }
    }),

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
