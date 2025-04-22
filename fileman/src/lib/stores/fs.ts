import { invoke } from '@tauri-apps/api/core';
import { writable, derived, get } from 'svelte/store';

export enum FileType {
  File = 'File',
  Directory = 'Directory',
  Symlink = 'Symlink',
  Other = 'Other',
}

export interface FileItem {
  name: string;
  path: string;
  file_type: FileType;
  size: number;
  modified?: number;
  created?: number;
  is_hidden: boolean;
}

export interface FileSystemState {
  currentPath: string;
  items: FileItem[];
  selectedItems: Set<string>;
  loading: boolean;
  error: string | null;
  history: string[];
  historyIndex: number;
  favorites: string[];
}

// Initial state
const initialState: FileSystemState = {
  currentPath: '',
  items: [],
  selectedItems: new Set<string>(),
  loading: false,
  error: null,
  history: [],
  historyIndex: -1,
  favorites: [],
};

function createFileSystemStore(id: string = 'main') {
  // Create a fresh copy of the initial state to avoid sharing state between instances
  const freshState = { ...initialState, selectedItems: new Set<string>() };
  const { subscribe, set, update } = writable<FileSystemState>(freshState);

  // Initialize with home directory
  async function init() {
    try {
      const homePath = await invoke<string>('get_home_dir');
      await navigateTo(homePath);

      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('fileman_favorites');
      if (savedFavorites) {
        update(state => ({
          ...state,
          favorites: JSON.parse(savedFavorites)
        }));
      } else {
        // Default favorites
        update(state => ({
          ...state,
          favorites: [homePath]
        }));
      }
    } catch (error) {
      console.error(`Failed to initialize file system (${id}):`, error);
      update(state => ({ ...state, error: String(error) }));
    }
  }

  async function navigateTo(path: string, addToHistory = true) {
    update(state => ({ ...state, loading: true, error: null }));

    try {
      const items = await invoke<FileItem[]>('list_directory', { path });

      update(state => {
        // Add to history if needed
        let newHistory = [...state.history];
        let newHistoryIndex = state.historyIndex;

        if (addToHistory) {
          // If we're not at the end of the history, truncate it
          if (state.historyIndex < state.history.length - 1) {
            newHistory = newHistory.slice(0, state.historyIndex + 1);
          }

          newHistory.push(path);
          newHistoryIndex = newHistory.length - 1;
        }

        return {
          ...state,
          currentPath: path,
          items,
          selectedItems: new Set<string>(),
          loading: false,
          history: newHistory,
          historyIndex: newHistoryIndex,
        };
      });
    } catch (error) {
      console.error('Failed to navigate:', error);
      update(state => ({ ...state, loading: false, error: String(error) }));
    }
  }

  async function navigateUp() {
    const state = get({ subscribe });
    if (!state.currentPath) return;

    try {
      const parentPath = await invoke<string>('get_parent_directory', { path: state.currentPath });
      await navigateTo(parentPath);
    } catch (error) {
      console.error('Failed to navigate up:', error);
      update(state => ({ ...state, error: String(error) }));
    }
  }

  function navigateBack() {
    update(state => {
      if (state.historyIndex <= 0) return state;

      const newIndex = state.historyIndex - 1;
      const path = state.history[newIndex];

      // We'll navigate without adding to history
      navigateTo(path, false);

      return {
        ...state,
        historyIndex: newIndex,
      };
    });
  }

  function navigateForward() {
    update(state => {
      if (state.historyIndex >= state.history.length - 1) return state;

      const newIndex = state.historyIndex + 1;
      const path = state.history[newIndex];

      // We'll navigate without adding to history
      navigateTo(path, false);

      return {
        ...state,
        historyIndex: newIndex,
      };
    });
  }

  function selectItem(path: string, multiSelect = false) {
    update(state => {
      const newSelectedItems = new Set(multiSelect ? state.selectedItems : []);

      if (newSelectedItems.has(path)) {
        newSelectedItems.delete(path);
      } else {
        newSelectedItems.add(path);
      }

      return {
        ...state,
        selectedItems: newSelectedItems,
      };
    });
  }

  function clearSelection() {
    update(state => ({
      ...state,
      selectedItems: new Set<string>(),
    }));
  }

  async function createDirectory(name: string) {
    const state = get({ subscribe });
    const newPath = `${state.currentPath}/${name}`.replace(/\/\//g, '/');

    try {
      await invoke('create_directory', { path: newPath });
      await refreshCurrentDirectory();
    } catch (error) {
      console.error('Failed to create directory:', error);
      update(state => ({ ...state, error: String(error) }));
    }
  }

  async function deleteSelected(recursive = true) {
    const state = get({ subscribe });
    const selectedPaths = Array.from(state.selectedItems);

    if (selectedPaths.length === 0) return;

    try {
      for (const path of selectedPaths) {
        await invoke('delete_item', { path, recursive });
      }

      await refreshCurrentDirectory();
    } catch (error) {
      console.error('Failed to delete items:', error);
      update(state => ({ ...state, error: String(error) }));
    }
  }

  async function renameItem(oldPath: string, newName: string) {
    const oldPathObj = new URL(`file://${oldPath}`);
    const dirPath = oldPathObj.pathname.substring(0, oldPathObj.pathname.lastIndexOf('/'));
    const newPath = `${dirPath}/${newName}`;

    try {
      await invoke('rename_item', { from: oldPath, to: newPath });
      await refreshCurrentDirectory();
    } catch (error) {
      console.error('Failed to rename item:', error);
      update(state => ({ ...state, error: String(error) }));
    }
  }

  async function copySelected(targetPath: string) {
    const state = get({ subscribe });
    const selectedPaths = Array.from(state.selectedItems);

    if (selectedPaths.length === 0) return;

    try {
      for (const path of selectedPaths) {
        const fileName = path.split('/').pop() || '';
        const destPath = `${targetPath}/${fileName}`.replace(/\/\//g, '/');

        await invoke('copy_item', { from: path, to: destPath });
      }

      await refreshCurrentDirectory();
    } catch (error) {
      console.error('Failed to copy items:', error);
      update(state => ({ ...state, error: String(error) }));
    }
  }

  async function moveSelected(targetPath: string) {
    const state = get({ subscribe });
    const selectedPaths = Array.from(state.selectedItems);

    if (selectedPaths.length === 0) return;

    try {
      for (const path of selectedPaths) {
        const fileName = path.split('/').pop() || '';
        const destPath = `${targetPath}/${fileName}`.replace(/\/\//g, '/');

        await invoke('rename_item', { from: path, to: destPath });
      }

      await refreshCurrentDirectory();
    } catch (error) {
      console.error('Failed to move items:', error);
      update(state => ({ ...state, error: String(error) }));
    }
  }

  async function refreshCurrentDirectory() {
    const state = get({ subscribe });
    await navigateTo(state.currentPath, false);
  }

  function addToFavorites(path: string) {
    update(state => {
      if (state.favorites.includes(path)) return state;

      const newFavorites = [...state.favorites, path];
      localStorage.setItem('fileman_favorites', JSON.stringify(newFavorites));

      return {
        ...state,
        favorites: newFavorites,
      };
    });
  }

  function removeFromFavorites(path: string) {
    update(state => {
      const newFavorites = state.favorites.filter(p => p !== path);
      localStorage.setItem('fileman_favorites', JSON.stringify(newFavorites));

      return {
        ...state,
        favorites: newFavorites,
      };
    });
  }

  return {
    subscribe,
    init,
    navigateTo,
    navigateUp,
    navigateBack,
    navigateForward,
    selectItem,
    clearSelection,
    createDirectory,
    deleteSelected,
    renameItem,
    copySelected,
    moveSelected,
    refreshCurrentDirectory,
    addToFavorites,
    removeFromFavorites,
  };
}

// Create two file system instances - one for each pane
export const leftPaneFS = createFileSystemStore('left');
export const rightPaneFS = createFileSystemStore('right');

// For backward compatibility, export the left pane as the default fileSystem
export const fileSystem = leftPaneFS;

// Derived stores for convenience (using the left pane as the primary)
export const currentPath = derived(leftPaneFS, $fs => $fs.currentPath);
export const currentItems = derived(leftPaneFS, $fs => $fs.items);
export const selectedItems = derived(leftPaneFS, $fs => $fs.selectedItems);
export const isLoading = derived(leftPaneFS, $fs => $fs.loading);
export const error = derived(leftPaneFS, $fs => $fs.error);
export const favorites = derived(leftPaneFS, $fs => $fs.favorites);
export const canGoBack = derived(leftPaneFS, $fs => $fs.historyIndex > 0);
export const canGoForward = derived(leftPaneFS, $fs => $fs.historyIndex < $fs.history.length - 1);
