import { writable, derived, get } from 'svelte/store';
import type { CalendarState, CalendarSource, CalendarEvent } from '$lib/types/calendar';
import { fetchCalendarSource } from '$lib/services/icsService';

// Initial state
const initialState: CalendarState = {
  sources: [],
  isLoading: false,
  error: undefined
};

// Create the writable store
const calendarStore = writable<CalendarState>(initialState);

// Derived store for all events from all sources
export const allEvents = derived(calendarStore, ($state) => {
  return $state.sources.flatMap(source => 
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
    calendarStore.update(state => ({ ...state, isLoading: true, error: undefined }));
    
    try {
      // Generate a unique ID for the source
      const id = `source-${Date.now()}`;
      
      // Fetch and parse the calendar source
      const source = await fetchCalendarSource(url, name, id, color);
      
      // Add the source to the store
      calendarStore.update(state => ({
        ...state,
        sources: [...state.sources, source],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding calendar source:', error);
      calendarStore.update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  },
  
  /**
   * Remove a calendar source by ID
   */
  removeSource(sourceId: string): void {
    calendarStore.update(state => ({
      ...state,
      sources: state.sources.filter(source => source.id !== sourceId)
    }));
  },
  
  /**
   * Refresh a specific calendar source
   */
  async refreshSource(sourceId: string): Promise<void> {
    const state = get(calendarStore);
    const source = state.sources.find(s => s.id === sourceId);
    
    if (!source) {
      console.error(`Source with ID ${sourceId} not found`);
      return;
    }
    
    calendarStore.update(state => ({ ...state, isLoading: true, error: undefined }));
    
    try {
      const updatedSource = await fetchCalendarSource(
        source.url,
        source.name,
        source.id,
        source.color
      );
      
      calendarStore.update(state => ({
        ...state,
        sources: state.sources.map(s => 
          s.id === sourceId ? updatedSource : s
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error refreshing calendar source:', error);
      calendarStore.update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  },
  
  /**
   * Refresh all calendar sources
   */
  async refreshAllSources(): Promise<void> {
    const state = get(calendarStore);
    
    if (state.sources.length === 0) {
      return;
    }
    
    calendarStore.update(state => ({ ...state, isLoading: true, error: undefined }));
    
    try {
      const updatedSources = await Promise.all(
        state.sources.map(source => 
          fetchCalendarSource(source.url, source.name, source.id, source.color)
        )
      );
      
      calendarStore.update(state => ({
        ...state,
        sources: updatedSources,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error refreshing all calendar sources:', error);
      calendarStore.update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  },
  
  /**
   * Clear all calendar sources
   */
  clearAllSources(): void {
    calendarStore.set({
      sources: [],
      isLoading: false,
      error: undefined
    });
  }
};

// Export the readable store
export const calendar = {
  subscribe: calendarStore.subscribe
};
