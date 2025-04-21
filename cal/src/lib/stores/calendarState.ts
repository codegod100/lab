import { writable, derived, get } from 'svelte/store';
import type { CalendarState, CalendarSource, CalendarEvent } from '$lib/types/calendar';
import { fetchCalendarSource } from '$lib/services/icsService';
import { browser } from '$app/environment';

// Storage key for localStorage
const STORAGE_KEY = 'calendar-sources';

// Load sources from localStorage if available
function loadSavedSources(): CalendarSource[] {
  if (browser) {
    try {
      const savedSources = localStorage.getItem(STORAGE_KEY);
      if (savedSources) {
        const parsedSources = JSON.parse(savedSources);

        // Convert date strings back to Date objects
        return parsedSources.map((source: Omit<CalendarSource, 'lastUpdated' | 'events'> & {
          lastUpdated?: string;
          events: Array<Omit<CalendarEvent, 'start' | 'end'> & { start: string; end: string; }>;
        }) => ({
          ...source,
          lastUpdated: source.lastUpdated ? new Date(source.lastUpdated) : undefined,
          events: source.events.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }))
        }));
      }
    } catch (err) {
      console.error('Error loading saved sources:', err);
    }
  }
  return [];
}

// Initial state
const initialState: CalendarState = {
  sources: loadSavedSources(),
  isLoading: false,
  error: undefined
};

// Create stores
export const sources = writable<CalendarSource[]>(initialState.sources);
export const isLoading = writable<boolean>(initialState.isLoading);
export const error = writable<string | undefined>(initialState.error);

// Save sources to localStorage whenever they change
sources.subscribe(currentSources => {
  if (browser && currentSources) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSources));
    } catch (err) {
      console.error('Error saving sources to localStorage:', err);
    }
  }
});

// Auto-refresh function will be called after calendarActions are defined

// Derived store for all events
export const allEvents = derived<typeof sources, CalendarEvent[]>(sources, $sources => {
  return $sources.flatMap(source =>
    source.events.map(event => ({
      ...event,
      color: event.color || source.color
    }))
  );
});

// Actions
export const calendarActions = {
  /**
   * Add a new calendar source
   */
  async addSource(url: string, name: string, color?: string): Promise<void> {
    // Update loading state
    isLoading.set(true);
    error.set(undefined);

    try {
      // Generate a unique ID for the source
      const id = `source-${Date.now()}`;

      // Fetch and parse the calendar source
      const source = await fetchCalendarSource(url, name, id, color);

      // Add the source to the state
      sources.update(currentSources => [...currentSources, source]);
      isLoading.set(false);
    } catch (err) {
      console.error('Error adding calendar source:', err);
      isLoading.set(false);
      error.set(err instanceof Error ? err.message : String(err));
    }
  },

  /**
   * Remove a calendar source by ID
   */
  removeSource(sourceId: string): void {
    sources.update(currentSources => currentSources.filter(source => source.id !== sourceId));
  },

  /**
   * Refresh a specific calendar source
   */
  async refreshSource(sourceId: string): Promise<void> {
    let source: CalendarSource | undefined;

    sources.update(currentSources => {
      source = currentSources.find(s => s.id === sourceId);
      return currentSources;
    });

    if (!source) {
      console.error(`Source with ID ${sourceId} not found`);
      return;
    }

    isLoading.set(true);
    error.set(undefined);

    try {
      const updatedSource = await fetchCalendarSource(
        source.url,
        source.name,
        source.id,
        source.color
      );

      sources.update(currentSources =>
        currentSources.map(s => s.id === sourceId ? updatedSource : s)
      );
      isLoading.set(false);
    } catch (err) {
      console.error('Error refreshing calendar source:', err);
      isLoading.set(false);
      error.set(err instanceof Error ? err.message : String(err));
    }
  },

  /**
   * Refresh all calendar sources
   */
  async refreshAllSources(): Promise<void> {
    let currentSources: CalendarSource[] = [];

    sources.update(sources => {
      currentSources = sources;
      return sources;
    });

    if (currentSources.length === 0) {
      return;
    }

    isLoading.set(true);
    error.set(undefined);

    try {
      const updatedSources = await Promise.all(
        currentSources.map(source =>
          fetchCalendarSource(source.url, source.name, source.id, source.color)
        )
      );

      sources.set(updatedSources);
      isLoading.set(false);
    } catch (err) {
      console.error('Error refreshing all calendar sources:', err);
      isLoading.set(false);
      error.set(err instanceof Error ? err.message : String(err));
    }
  },

  /**
   * Clear all calendar sources
   */
  clearAllSources(): void {
    sources.set([]);
    isLoading.set(false);
    error.set(undefined);
  }
};

// Auto-refresh sources on initial load if there are any saved sources
if (browser && initialState.sources.length > 0) {
  // Use setTimeout to ensure this runs after the component is mounted
  setTimeout(() => {
    calendarActions.refreshAllSources().catch(err => {
      console.error('Error auto-refreshing sources:', err);
    });
  }, 1000);
}
